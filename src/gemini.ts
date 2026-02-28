import type {
  GeminiRequest,
  GeminiResponse,
  GenerateImageOptions,
  GeneratedImage,
  DescribeImageOptions,
} from "./types.js";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const ALLOWED_MODELS = [
  "gemini-3.1-flash-image-preview",  // Nano Banana 2 (latest, recommended)
  "gemini-3-pro-image-preview",      // Nano Banana Pro (highest quality)
  "gemini-2.5-flash-preview-05-20",  // Nano Banana (fast)
  "gemini-2.0-flash-exp",            // Widely available fallback
] as const;

const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";

export class GeminiImageClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }
    this.apiKey = apiKey;
  }

  async generateImage(options: GenerateImageOptions): Promise<GeneratedImage> {
    const { prompt, aspectRatio, imageSize, images, personGeneration, useGoogleSearch, thinkingConfig } = options;
    const model = options.model || DEFAULT_MODEL;

    if (!ALLOWED_MODELS.includes(model as typeof ALLOWED_MODELS[number])) {
      throw new Error(
        `Invalid model: ${model}. Allowed: ${ALLOWED_MODELS.join(", ")}`
      );
    }

    const supportsImageConfig = model.includes("image") || model.includes("imagen");

    const requestParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt }
    ];

    if (images && images.length > 0) {
      for (const img of images) {
        requestParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data,
          },
        });
      }
    }

    const requestBody: GeminiRequest = {
      contents: [
        {
          parts: requestParts,
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        ...(supportsImageConfig && (aspectRatio || imageSize)
          ? {
              imageConfig: {
                ...(aspectRatio && { aspectRatio }),
                ...(imageSize && { imageSize }),
              },
            }
          : {}),
        ...(thinkingConfig ? { thinkingConfig } : {}),
      },
    };

    if (useGoogleSearch) {
      requestBody.tools = [{ google_search: {} }];
    }

    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as GeminiResponse;

    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No image generated - empty response from Gemini");
    }

    const candidate = data.candidates[0];
    const responseParts = candidate.content.parts;
    let imageData: GeneratedImage | null = null;
    let description: string | undefined;
    let thoughts: string | undefined;

    for (const part of responseParts) {
      if ("inlineData" in part && part.inlineData) {
        imageData = {
          mimeType: part.inlineData.mimeType,
          base64Data: part.inlineData.data,
        };
      } else if ("text" in part && part.text) {
        if (part.thought) {
          thoughts = (thoughts ? thoughts + "\n" : "") + part.text;
        } else {
          description = part.text;
        }
      }
    }

    if (!imageData) {
      throw new Error("No image data in Gemini response");
    }

    const searchQueries = candidate.groundingMetadata?.webSearchQueries;

    return {
      ...imageData,
      description,
      ...(thoughts ? { thoughts } : {}),
      ...(searchQueries && searchQueries.length > 0 ? { searchQueries } : {}),
    };
  }

  async describeImage(options: DescribeImageOptions): Promise<string> {
    const { images, prompt } = options;
    const model = options.model || DEFAULT_MODEL;

    if (!ALLOWED_MODELS.includes(model as typeof ALLOWED_MODELS[number])) {
      throw new Error(
        `Invalid model: ${model}. Allowed: ${ALLOWED_MODELS.join(", ")}`
      );
    }

    if (!images || images.length === 0) {
      throw new Error("At least one image is required");
    }

    const defaultPrompt = "Describe this image in detail. What do you see?";
    const requestParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt || defaultPrompt }
    ];

    for (const img of images) {
      requestParts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        },
      });
    }

    const requestBody: GeminiRequest = {
      contents: [
        {
          parts: requestParts,
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT"],
      },
    };

    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as GeminiResponse;

    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini");
    }

    const responseParts = data.candidates[0].content.parts;
    let description = "";

    for (const part of responseParts) {
      if ("text" in part && part.text) {
        description += part.text;
      }
    }

    if (!description) {
      throw new Error("No description in Gemini response");
    }

    return description;
  }
}
