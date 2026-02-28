#!/usr/bin/env node

import { createRequire } from "node:module";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { dirname, resolve } from "path";
import { GeminiImageClient } from "./gemini.js";
import { IMAGE_PROMPTS } from "./prompts.js";

async function saveImageToFile(
  base64Data: string,
  outputPath: string
): Promise<string> {
  const absolutePath = resolve(outputPath);
  const dir = dirname(absolutePath);

  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(base64Data, "base64");
  await writeFile(absolutePath, buffer);

  return absolutePath;
}

const ASPECT_RATIOS = [
  "1:1",
  "3:2", "2:3",
  "3:4", "4:3",
  "4:5", "5:4",
  "9:16", "16:9",
  "21:9",
  "4:1", "1:4",
  "8:1", "1:8",
] as const;

const IMAGE_SIZES = ["512px", "1K", "2K", "4K"] as const;

const imageInputSchema = z.object({
  data: z.string().describe("Base64 encoded image data"),
  mimeType: z.string().describe("MIME type of the image (e.g., image/png, image/jpeg)"),
});

const generateImageSchema = z.object({
  prompt: z.string().describe("Description of the image to generate"),
  aspectRatio: z
    .enum(ASPECT_RATIOS)
    .optional()
    .default("1:1")
    .describe("Aspect ratio of the generated image"),
  imageSize: z
    .enum(IMAGE_SIZES)
    .optional()
    .default("1K")
    .describe("Resolution of the generated image"),
  model: z
    .string()
    .optional()
    .describe("Gemini model to use (default: gemini-3.1-flash-image-preview)"),
  images: z
    .array(imageInputSchema)
    .optional()
    .describe("Optional reference images to guide generation"),
  outputPath: z
    .string()
    .optional()
    .describe("Optional file path to save the generated image (e.g., /path/to/image.png)"),
  personGeneration: z
    .enum(["ALLOW_ALL", "ALLOW_ADULT", "ALLOW_NONE"])
    .optional()
    .describe("Controls the generation of people in images"),
  useGoogleSearch: z
    .boolean()
    .optional()
    .default(false)
    .describe("Enable Google Search grounding to use real-time web data for more accurate image generation"),
  thinkingConfig: z
    .object({
      thinkingLevel: z
        .enum(["MINIMAL", "LOW", "MEDIUM", "HIGH"])
        .optional()
        .describe("Thinking reasoning depth"),
      includeThoughts: z
        .boolean()
        .optional()
        .describe("Whether to return the reasoning process"),
    })
    .optional()
    .describe("Controls the model's thinking/reasoning behavior"),
});

const editImageSchema = z.object({
  prompt: z.string().describe("Instructions for how to edit the image(s)"),
  images: z
    .array(imageInputSchema)
    .min(1)
    .describe("One or more images to edit"),
  model: z
    .string()
    .optional()
    .describe("Gemini model to use (default: gemini-3.1-flash-image-preview)"),
  outputPath: z
    .string()
    .optional()
    .describe("Optional file path to save the edited image (e.g., /path/to/image.png)"),
  personGeneration: z
    .enum(["ALLOW_ALL", "ALLOW_ADULT", "ALLOW_NONE"])
    .optional()
    .describe("Controls the generation of people in images"),
});

const describeImageSchema = z.object({
  images: z
    .array(imageInputSchema)
    .min(1)
    .describe("One or more images to describe/analyze"),
  prompt: z
    .string()
    .optional()
    .describe("Optional custom prompt for analysis (default: general description)"),
  model: z
    .string()
    .optional()
    .describe("Gemini model to use (default: gemini-3.1-flash-image-preview)"),
});

export function createServer(apiKey: string): Server {
  const client = new GeminiImageClient(apiKey);

  const server = new Server(
    {
      name: "nano-banana-pro-mcp",
      version,
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "generate_image",
          description:
            "Generate an image using Google Gemini. Optionally provide reference images to guide the generation style or content. Returns a base64-encoded image.",
          inputSchema: {
            type: "object" as const,
            properties: {
              prompt: {
                type: "string",
                description: "Description of the image to generate",
              },
              aspectRatio: {
                type: "string",
                enum: [...ASPECT_RATIOS],
                description: "Aspect ratio of the generated image. Nano Banana 2 exclusive ultra-wide/tall: 4:1, 1:4, 8:1, 1:8",
                default: "1:1",
              },
              imageSize: {
                type: "string",
                enum: [...IMAGE_SIZES],
                description: "Resolution of the generated image (512px for fast iterations, 1K default, 2K/4K for high quality)",
                default: "1K",
              },
              model: {
                type: "string",
                description:
                  "Gemini model (gemini-3.1-flash-image-preview, gemini-3-pro-image-preview, gemini-2.5-flash-preview-05-20, or gemini-2.0-flash-exp)",
                default: "gemini-3.1-flash-image-preview",
              },
              images: {
                type: "array",
                description: "Optional reference images to guide generation (up to 10 object refs + 4 person refs = 14 total)",
                items: {
                  type: "object",
                  properties: {
                    data: { type: "string", description: "Base64 encoded image data" },
                    mimeType: { type: "string", description: "MIME type (e.g., image/png)" },
                  },
                  required: ["data", "mimeType"],
                },
              },
              outputPath: {
                type: "string",
                description: "Optional file path to save the generated image (e.g., /path/to/image.png)",
              },
              personGeneration: {
                type: "string",
                enum: ["ALLOW_ALL", "ALLOW_ADULT", "ALLOW_NONE"],
                description: "Controls the generation of people in images",
              },
              useGoogleSearch: {
                type: "boolean",
                description: "Enable Google Search grounding to use real-time web data for more accurate image generation (e.g., current weather, real products, recent events)",
                default: false,
              },
              thinkingConfig: {
                type: "object",
                description: "Controls the model's thinking/reasoning behavior for complex compositions",
                properties: {
                  thinkingLevel: {
                    type: "string",
                    enum: ["MINIMAL", "LOW", "MEDIUM", "HIGH"],
                    description: "Thinking depth: MINIMAL (fast, default) or HIGH (better for complex scenes, precise text)",
                  },
                  includeThoughts: {
                    type: "boolean",
                    description: "Whether to return the reasoning process",
                  },
                },
              },
            },
            required: ["prompt"],
          },
        },
        {
          name: "edit_image",
          description:
            "Edit one or more images using Google Gemini. Provide images and instructions for how to modify them. Returns a base64-encoded image.",
          inputSchema: {
            type: "object" as const,
            properties: {
              prompt: {
                type: "string",
                description: "Instructions for how to edit the image(s)",
              },
              images: {
                type: "array",
                description: "One or more images to edit",
                items: {
                  type: "object",
                  properties: {
                    data: { type: "string", description: "Base64 encoded image data" },
                    mimeType: { type: "string", description: "MIME type (e.g., image/png)" },
                  },
                  required: ["data", "mimeType"],
                },
                minItems: 1,
              },
              model: {
                type: "string",
                description:
                  "Gemini model (gemini-3.1-flash-image-preview, gemini-3-pro-image-preview, gemini-2.5-flash-preview-05-20, or gemini-2.0-flash-exp)",
                default: "gemini-3.1-flash-image-preview",
              },
              outputPath: {
                type: "string",
                description: "Optional file path to save the edited image (e.g., /path/to/image.png)",
              },
              personGeneration: {
                type: "string",
                enum: ["ALLOW_ALL", "ALLOW_ADULT", "ALLOW_NONE"],
                description: "Controls the generation of people in images",
              },
            },
            required: ["prompt", "images"],
          },
        },
        {
          name: "describe_image",
          description:
            "Analyze and describe one or more images using Google Gemini. Returns a text description of the image contents.",
          inputSchema: {
            type: "object" as const,
            properties: {
              images: {
                type: "array",
                description: "One or more images to describe/analyze",
                items: {
                  type: "object",
                  properties: {
                    data: { type: "string", description: "Base64 encoded image data" },
                    mimeType: { type: "string", description: "MIME type (e.g., image/png)" },
                  },
                  required: ["data", "mimeType"],
                },
                minItems: 1,
              },
              prompt: {
                type: "string",
                description: "Optional custom prompt for analysis (default: general description)",
              },
              model: {
                type: "string",
                description:
                  "Gemini model (gemini-3.1-flash-image-preview, gemini-3-pro-image-preview, gemini-2.5-flash-preview-05-20, or gemini-2.0-flash-exp)",
                default: "gemini-3.1-flash-image-preview",
              },
            },
            required: ["images"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "generate_image") {
      try {
        const args = generateImageSchema.parse(request.params.arguments);
        const result = await client.generateImage(args);

        let savedPath: string | undefined;
        if (args.outputPath) {
          savedPath = await saveImageToFile(result.base64Data, args.outputPath);
        }

        return {
          content: [
            {
              type: "image" as const,
              data: result.base64Data,
              mimeType: result.mimeType,
            },
            ...(savedPath
              ? [{ type: "text" as const, text: `Image saved to: ${savedPath}` }]
              : []),
            ...(result.description
              ? [{ type: "text" as const, text: result.description }]
              : []),
            ...(result.thoughts
              ? [{ type: "text" as const, text: `[Thinking] ${result.thoughts}` }]
              : []),
            ...(result.searchQueries && result.searchQueries.length > 0
              ? [{ type: "text" as const, text: `[Search queries] ${result.searchQueries.join(", ")}` }]
              : []),
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Failed to generate image: ${message}`,
            },
          ],
        };
      }
    }

    if (request.params.name === "edit_image") {
      try {
        const args = editImageSchema.parse(request.params.arguments);
        const result = await client.generateImage({
          prompt: args.prompt,
          images: args.images,
          model: args.model,
          personGeneration: args.personGeneration,
        });

        let savedPath: string | undefined;
        if (args.outputPath) {
          savedPath = await saveImageToFile(result.base64Data, args.outputPath);
        }

        return {
          content: [
            {
              type: "image" as const,
              data: result.base64Data,
              mimeType: result.mimeType,
            },
            ...(savedPath
              ? [{ type: "text" as const, text: `Image saved to: ${savedPath}` }]
              : []),
            ...(result.description
              ? [{ type: "text" as const, text: result.description }]
              : []),
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Failed to edit image: ${message}`,
            },
          ],
        };
      }
    }

    if (request.params.name === "describe_image") {
      try {
        const args = describeImageSchema.parse(request.params.arguments);
        const description = await client.describeImage({
          images: args.images,
          prompt: args.prompt,
          model: args.model,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: description,
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Failed to describe image: ${message}`,
            },
          ],
        };
      }
    }

    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `Unknown tool: ${request.params.name}`,
        },
      ],
    };
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: IMAGE_PROMPTS.map((p) => ({
        name: p.name,
        title: p.title,
        description: p.description,
        arguments: p.arguments.map((a) => ({
          name: a.name,
          description: a.description,
          required: a.required,
        })),
      })),
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const promptDef = IMAGE_PROMPTS.find(
      (p) => p.name === request.params.name
    );

    if (!promptDef) {
      throw new Error(`Unknown prompt: ${request.params.name}`);
    }

    const args = request.params.arguments ?? {};
    const messages = promptDef.buildMessages(args);

    return {
      description: promptDef.description,
      messages,
    };
  });

  return server;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY environment variable is required");
    console.error("Set it with: export GEMINI_API_KEY=your_key_here");
    process.exit(1);
  }

  const server = createServer(apiKey);
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error("Nano Banana Pro MCP server started");
}

const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("nano-banana-pro-mcp");

if (isMainModule) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
