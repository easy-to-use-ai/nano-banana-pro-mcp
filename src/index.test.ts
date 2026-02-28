import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createServer } from "./index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

import { writeFile, mkdir } from "fs/promises";

const VALID_BASE64_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

describe("MCP Server", () => {
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(writeFile).mockClear();
    vi.mocked(mkdir).mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function createTestClient() {
    const server = createServer(mockApiKey);
    const client = new Client({ name: "test-client", version: "1.0.0" });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    return { client, server };
  }

  describe("listTools", () => {
    it("should list all three image tools", async () => {
      const { client } = await createTestClient();
      const result = await client.listTools();

      expect(result.tools).toHaveLength(3);
      expect(result.tools[0].name).toBe("generate_image");
      expect(result.tools[0].description).toContain("Google Gemini");
      expect(result.tools[0].inputSchema.required).toContain("prompt");
      expect(result.tools[1].name).toBe("edit_image");
      expect(result.tools[1].description).toContain("Edit");
      expect(result.tools[1].inputSchema.required).toContain("images");
      expect(result.tools[2].name).toBe("describe_image");
      expect(result.tools[2].description).toContain("Analyze");
      expect(result.tools[2].inputSchema.required).toContain("images");
    });

    it("should have correct input schema for generate_image", async () => {
      const { client } = await createTestClient();
      const result = await client.listTools();

      const tool = result.tools[0];
      const properties = tool.inputSchema.properties as Record<string, unknown>;

      expect(properties.prompt).toBeDefined();
      expect(properties.aspectRatio).toBeDefined();
      expect(properties.imageSize).toBeDefined();
      expect(properties.images).toBeDefined();
      expect(properties.personGeneration).toBeDefined();
      expect(properties.useGoogleSearch).toBeDefined();
      expect(properties.thinkingConfig).toBeDefined();
    });

    it("should expose all 14 aspect ratios in generate_image schema", async () => {
      const { client } = await createTestClient();
      const result = await client.listTools();

      const tool = result.tools[0];
      const aspectRatio = (tool.inputSchema.properties as Record<string, { enum?: string[] }>).aspectRatio;

      expect(aspectRatio.enum).toContain("1:1");
      expect(aspectRatio.enum).toContain("16:9");
      expect(aspectRatio.enum).toContain("21:9");
      expect(aspectRatio.enum).toContain("4:1");
      expect(aspectRatio.enum).toContain("1:4");
      expect(aspectRatio.enum).toContain("8:1");
      expect(aspectRatio.enum).toContain("1:8");
      expect(aspectRatio.enum).toHaveLength(14);
    });

    it("should expose 512px in imageSize enum", async () => {
      const { client } = await createTestClient();
      const result = await client.listTools();

      const tool = result.tools[0];
      const imageSize = (tool.inputSchema.properties as Record<string, { enum?: string[] }>).imageSize;

      expect(imageSize.enum).toContain("512px");
      expect(imageSize.enum).toContain("1K");
      expect(imageSize.enum).toContain("2K");
      expect(imageSize.enum).toContain("4K");
      expect(imageSize.enum).toHaveLength(4);
    });

    it("should have correct input schema for edit_image", async () => {
      const { client } = await createTestClient();
      const result = await client.listTools();

      const tool = result.tools[1];
      const properties = tool.inputSchema.properties as Record<string, unknown>;

      expect(properties.prompt).toBeDefined();
      expect(properties.images).toBeDefined();
      expect(properties.model).toBeDefined();
      expect(properties.personGeneration).toBeDefined();
    });
  });

  describe("callTool - generate_image", () => {
    it("should generate image successfully", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: "A majestic mountain" },
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: VALID_BASE64_PNG,
                  },
                },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "generate_image",
        arguments: { prompt: "a mountain landscape" },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toEqual({
        type: "image",
        data: VALID_BASE64_PNG,
        mimeType: "image/png",
      });
      expect(result.content[1]).toEqual({
        type: "text",
        text: "A majestic mountain",
      });
    });

    it("should handle image generation without description", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: VALID_BASE64_PNG,
                  },
                },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "generate_image",
        arguments: { prompt: "abstract art" },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({
        type: "image",
        data: VALID_BASE64_PNG,
        mimeType: "image/png",
      });
    });

    it("should pass custom aspect ratio and size for image models", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: VALID_BASE64_PNG,
                  },
                },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      await client.callTool({
        name: "generate_image",
        arguments: {
          prompt: "panorama",
          aspectRatio: "16:9",
          imageSize: "4K",
          model: "gemini-3-pro-image-preview",
        },
      });

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body.generationConfig.imageConfig).toEqual({
        aspectRatio: "16:9",
        imageSize: "4K",
      });
    });

    it("should support ultra-wide 8:1 aspect ratio", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { inlineData: { mimeType: "image/png", data: VALID_BASE64_PNG } },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      await client.callTool({
        name: "generate_image",
        arguments: {
          prompt: "a panoramic banner",
          aspectRatio: "8:1",
          imageSize: "2K",
        },
      });

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body.generationConfig.imageConfig.aspectRatio).toBe("8:1");
    });

    it("should enable google search when useGoogleSearch is true", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: "Weather info" },
                { inlineData: { mimeType: "image/png", data: VALID_BASE64_PNG } },
              ],
            },
            groundingMetadata: {
              webSearchQueries: ["Shanghai weather today"],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "generate_image",
        arguments: {
          prompt: "Today's weather infographic for Shanghai",
          useGoogleSearch: true,
        },
      });

      expect(result.isError).toBeFalsy();

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.tools).toEqual([{ google_search: {} }]);

      const textContents = (result.content as Array<{ type: string; text?: string }>)
        .filter(c => c.type === "text")
        .map(c => c.text);
      expect(textContents.some(t => t?.includes("Search queries"))).toBe(true);
    });

    it("should pass thinkingConfig through MCP tool", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: "My reasoning...", thought: true },
                { inlineData: { mimeType: "image/png", data: VALID_BASE64_PNG } },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "generate_image",
        arguments: {
          prompt: "complex scene with many elements",
          thinkingConfig: { thinkingLevel: "HIGH", includeThoughts: true },
        },
      });

      expect(result.isError).toBeFalsy();

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.generationConfig.thinkingConfig).toEqual({
        thinkingLevel: "HIGH",
        includeThoughts: true,
      });

      const textContents = (result.content as Array<{ type: string; text?: string }>)
        .filter(c => c.type === "text")
        .map(c => c.text);
      expect(textContents.some(t => t?.includes("[Thinking]"))).toBe(true);
    });

    it("should return error on API failure", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "generate_image",
        arguments: { prompt: "test" },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]).toMatchObject({
        type: "text",
        text: expect.stringContaining("Failed to generate image"),
      });
    });

    it("should return error for invalid prompt type", async () => {
      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "generate_image",
        arguments: { prompt: 123 },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]).toMatchObject({
        type: "text",
        text: expect.stringContaining("Failed to generate image"),
      });
    });

    it("should save image to file when outputPath is provided", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: VALID_BASE64_PNG,
                  },
                },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "generate_image",
        arguments: {
          prompt: "a test image",
          outputPath: "/tmp/test-output/image.png",
        },
      });

      expect(result.isError).toBeFalsy();
      expect(vi.mocked(mkdir)).toHaveBeenCalledWith("/tmp/test-output", { recursive: true });
      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        "/tmp/test-output/image.png",
        expect.any(Buffer)
      );
      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toEqual({
        type: "image",
        data: VALID_BASE64_PNG,
        mimeType: "image/png",
      });
      expect(result.content[1]).toEqual({
        type: "text",
        text: "Image saved to: /tmp/test-output/image.png",
      });
    });

    it("should not save file when outputPath is not provided", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: VALID_BASE64_PNG,
                  },
                },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      await client.callTool({
        name: "generate_image",
        arguments: { prompt: "a test image" },
      });

      expect(vi.mocked(writeFile)).not.toHaveBeenCalled();
      expect(vi.mocked(mkdir)).not.toHaveBeenCalled();
    });
  });

  describe("callTool - generate_image with reference images", () => {
    it("should generate image with reference images", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: VALID_BASE64_PNG,
                  },
                },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "generate_image",
        arguments: {
          prompt: "Generate in this style",
          images: [
            { data: VALID_BASE64_PNG, mimeType: "image/png" },
          ],
        },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0]).toEqual({
        type: "image",
        data: VALID_BASE64_PNG,
        mimeType: "image/png",
      });

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.contents[0].parts).toHaveLength(2);
      expect(body.contents[0].parts[1].inlineData).toBeDefined();
    });
  });

  describe("callTool - edit_image", () => {
    it("should edit image successfully", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: "Edited image" },
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: VALID_BASE64_PNG,
                  },
                },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "edit_image",
        arguments: {
          prompt: "Add sunglasses to this image",
          images: [
            { data: VALID_BASE64_PNG, mimeType: "image/png" },
          ],
        },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toEqual({
        type: "image",
        data: VALID_BASE64_PNG,
        mimeType: "image/png",
      });
    });

    it("should edit with multiple images", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: VALID_BASE64_PNG,
                  },
                },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "edit_image",
        arguments: {
          prompt: "Combine these images",
          images: [
            { data: VALID_BASE64_PNG, mimeType: "image/png" },
            { data: VALID_BASE64_PNG, mimeType: "image/jpeg" },
          ],
        },
      });

      expect(result.isError).toBeFalsy();

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.contents[0].parts).toHaveLength(3);
    });

    it("should return error when no images provided to edit_image", async () => {
      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "edit_image",
        arguments: {
          prompt: "Edit this",
          images: [],
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]).toMatchObject({
        type: "text",
        text: expect.stringContaining("Failed to edit image"),
      });
    });

    it("should return error on API failure", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "edit_image",
        arguments: {
          prompt: "Edit this",
          images: [{ data: VALID_BASE64_PNG, mimeType: "image/png" }],
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]).toMatchObject({
        type: "text",
        text: expect.stringContaining("Failed to edit image"),
      });
    });

    it("should save edited image to file when outputPath is provided", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: VALID_BASE64_PNG,
                  },
                },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "edit_image",
        arguments: {
          prompt: "Add a hat",
          images: [{ data: VALID_BASE64_PNG, mimeType: "image/png" }],
          outputPath: "/tmp/edited-image.png",
        },
      });

      expect(result.isError).toBeFalsy();
      expect(vi.mocked(mkdir)).toHaveBeenCalledWith("/tmp", { recursive: true });
      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        "/tmp/edited-image.png",
        expect.any(Buffer)
      );
      expect(result.content).toHaveLength(2);
      expect(result.content[1]).toEqual({
        type: "text",
        text: "Image saved to: /tmp/edited-image.png",
      });
    });

    it("should accept personGeneration in edit_image without error", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { inlineData: { mimeType: "image/png", data: VALID_BASE64_PNG } },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "edit_image",
        arguments: {
          prompt: "Add people to this scene",
          images: [{ data: VALID_BASE64_PNG, mimeType: "image/png" }],
          personGeneration: "ALLOW_ALL",
        },
      });

      expect(result.isError).toBeFalsy();
    });
  });

  describe("callTool - describe_image", () => {
    it("should describe image successfully", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "A cute orange crab holding a banana phone" }],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "describe_image",
        arguments: {
          images: [{ data: VALID_BASE64_PNG, mimeType: "image/png" }],
        },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({
        type: "text",
        text: "A cute orange crab holding a banana phone",
      });
    });

    it("should describe image with custom prompt", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "There are 3 objects" }],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "describe_image",
        arguments: {
          images: [{ data: VALID_BASE64_PNG, mimeType: "image/png" }],
          prompt: "How many objects are in this image?",
        },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0]).toMatchObject({
        type: "text",
        text: "There are 3 objects",
      });

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.contents[0].parts[0].text).toBe("How many objects are in this image?");
    });

    it("should return error when no images provided", async () => {
      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "describe_image",
        arguments: {
          images: [],
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]).toMatchObject({
        type: "text",
        text: expect.stringContaining("Failed to describe image"),
      });
    });

    it("should return error on API failure", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      } as Response);

      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "describe_image",
        arguments: {
          images: [{ data: VALID_BASE64_PNG, mimeType: "image/png" }],
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]).toMatchObject({
        type: "text",
        text: expect.stringContaining("Failed to describe image"),
      });
    });
  });

  describe("callTool - unknown tool", () => {
    it("should return error for unknown tool", async () => {
      const { client } = await createTestClient();
      const result = await client.callTool({
        name: "unknown_tool",
        arguments: {},
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]).toMatchObject({
        type: "text",
        text: "Unknown tool: unknown_tool",
      });
    });
  });

  describe("prompts", () => {
    it("should list all 10 prompt templates", async () => {
      const { client } = await createTestClient();
      const result = await client.listPrompts();

      expect(result.prompts).toHaveLength(10);
      const names = result.prompts.map((p: { name: string }) => p.name);
      expect(names).toContain("ultra_wide_panorama");
      expect(names).toContain("weather_infographic");
      expect(names).toContain("ecommerce_banner");
      expect(names).toContain("product_detail_long");
      expect(names).toContain("scroll_painting_panorama");
      expect(names).toContain("resize_and_enhance");
      expect(names).toContain("character_multi_scene");
      expect(names).toContain("knowledge_card");
      expect(names).toContain("comic_storyboard");
      expect(names).toContain("brand_logo_system");
    });

    it("should have description and arguments for each prompt", async () => {
      const { client } = await createTestClient();
      const result = await client.listPrompts();

      for (const prompt of result.prompts) {
        expect(prompt.description).toBeTruthy();
        expect(prompt.arguments).toBeDefined();
        expect(prompt.arguments!.length).toBeGreaterThan(0);

        const hasRequired = prompt.arguments!.some(
          (a: { required?: boolean }) => a.required
        );
        expect(hasRequired).toBe(true);
      }
    });

    it("should get ultra_wide_panorama prompt with args", async () => {
      const { client } = await createTestClient();
      const result = await client.getPrompt({
        name: "ultra_wide_panorama",
        arguments: { city: "Tokyo", style: "cyberpunk", time_of_day: "night" },
      });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe("user");
      const text = (result.messages[0].content as { type: string; text: string }).text;
      expect(text).toContain("Tokyo");
      expect(text).toContain("cyberpunk");
      expect(text).toContain("night");
      expect(text).toContain("8:1");
    });

    it("should get weather_infographic prompt with google search", async () => {
      const { client } = await createTestClient();
      const result = await client.getPrompt({
        name: "weather_infographic",
        arguments: { city: "Shanghai", language: "English" },
      });

      const text = (result.messages[0].content as { type: string; text: string }).text;
      expect(text).toContain("Shanghai");
      expect(text).toContain("English");
      expect(text).toContain("useGoogleSearch: true");
    });

    it("should get scroll_painting_panorama with variant", async () => {
      const { client } = await createTestClient();
      const result = await client.getPrompt({
        name: "scroll_painting_panorama",
        arguments: { city: "Chengdu", variant: "ghibli" },
      });

      const text = (result.messages[0].content as { type: string; text: string }).text;
      expect(text).toContain("Chengdu");
      expect(text).toContain("Ghibli");
      expect(text).toContain("8:1");
    });

    it("should get product_detail_long prompt with 1:4 ratio", async () => {
      const { client } = await createTestClient();
      const result = await client.getPrompt({
        name: "product_detail_long",
        arguments: { product: "wireless earbuds" },
      });

      const text = (result.messages[0].content as { type: string; text: string }).text;
      expect(text).toContain("wireless earbuds");
      expect(text).toContain("1:4");
      expect(text).toContain("thinkingLevel");
    });

    it("should get brand_logo_system prompt with thinking mode", async () => {
      const { client } = await createTestClient();
      const result = await client.getPrompt({
        name: "brand_logo_system",
        arguments: { brand_name: "NovaTech", industry: "AI startup" },
      });

      const text = (result.messages[0].content as { type: string; text: string }).text;
      expect(text).toContain("NovaTech");
      expect(text).toContain("AI startup");
      expect(text).toContain("4K");
      expect(text).toContain("thinkingLevel");
    });

    it("should get knowledge_card prompt with search + thinking", async () => {
      const { client } = await createTestClient();
      const result = await client.getPrompt({
        name: "knowledge_card",
        arguments: { subject: "Giant Panda", card_type: "species" },
      });

      const text = (result.messages[0].content as { type: string; text: string }).text;
      expect(text).toContain("Giant Panda");
      expect(text).toContain("useGoogleSearch: true");
      expect(text).toContain("thinkingLevel");
    });

    it("should use default values when optional args are missing", async () => {
      const { client } = await createTestClient();
      const result = await client.getPrompt({
        name: "ultra_wide_panorama",
        arguments: { city: "Paris" },
      });

      const text = (result.messages[0].content as { type: string; text: string }).text;
      expect(text).toContain("Paris");
      expect(text).toContain("2K");
    });

    it("should throw for unknown prompt name", async () => {
      const { client } = await createTestClient();
      await expect(
        client.getPrompt({ name: "nonexistent_prompt" })
      ).rejects.toThrow();
    });
  });
});
