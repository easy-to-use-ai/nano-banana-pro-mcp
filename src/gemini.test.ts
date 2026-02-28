import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GeminiImageClient } from "./gemini.js";

describe("GeminiImageClient", () => {
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("constructor", () => {
    it("should create client with valid API key", () => {
      const client = new GeminiImageClient(mockApiKey);
      expect(client).toBeInstanceOf(GeminiImageClient);
    });

    it("should throw error when API key is empty", () => {
      expect(() => new GeminiImageClient("")).toThrow("GEMINI_API_KEY is required");
    });
  });

  describe("generateImage", () => {
    it("should generate image with default options", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: "A beautiful sunset" },
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: "base64encodedimage",
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

      const client = new GeminiImageClient(mockApiKey);
      const result = await client.generateImage({ prompt: "a sunset" });

      expect(result).toEqual({
        mimeType: "image/png",
        base64Data: "base64encodedimage",
        description: "A beautiful sunset",
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("gemini-3.1-flash-image-preview:generateContent"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("should pass aspect ratio and image size to API for image models", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: "base64data",
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

      const client = new GeminiImageClient(mockApiKey);
      await client.generateImage({
        prompt: "a cat",
        aspectRatio: "16:9",
        imageSize: "4K",
        model: "gemini-3-pro-image-preview",
      });

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body.generationConfig.imageConfig).toEqual({
        aspectRatio: "16:9",
        imageSize: "4K",
      });
    });

    it("should support new ultra-wide aspect ratios", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { inlineData: { mimeType: "image/png", data: "base64data" } },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);
      await client.generateImage({
        prompt: "a panoramic cityscape",
        aspectRatio: "8:1",
        imageSize: "2K",
      });

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body.generationConfig.imageConfig.aspectRatio).toBe("8:1");
      expect(body.generationConfig.imageConfig.imageSize).toBe("2K");
    });

    it("should support 512px image size", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { inlineData: { mimeType: "image/png", data: "base64data" } },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);
      await client.generateImage({
        prompt: "quick sketch",
        imageSize: "512px",
      });

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body.generationConfig.imageConfig.imageSize).toBe("512px");
    });

    it("should enable google_search when useGoogleSearch is true", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: "Weather infographic" },
                { inlineData: { mimeType: "image/png", data: "base64data" } },
              ],
            },
            groundingMetadata: {
              webSearchQueries: ["Tokyo weather today"],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);
      const result = await client.generateImage({
        prompt: "Generate a weather infographic for Tokyo today",
        useGoogleSearch: true,
      });

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body.tools).toEqual([{ google_search: {} }]);
      expect(result.searchQueries).toEqual(["Tokyo weather today"]);
    });

    it("should not include tools when useGoogleSearch is false or undefined", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { inlineData: { mimeType: "image/png", data: "base64data" } },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);
      await client.generateImage({ prompt: "a cat" });

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body.tools).toBeUndefined();
    });

    it("should accept personGeneration option without error", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { inlineData: { mimeType: "image/png", data: "base64data" } },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);
      const result = await client.generateImage({
        prompt: "a crowd scene",
        personGeneration: "ALLOW_ALL",
      });

      expect(result.base64Data).toBe("base64data");
    });

    it("should pass thinkingConfig to generationConfig", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: "Thought process...", thought: true },
                { text: "Generated image description" },
                { inlineData: { mimeType: "image/png", data: "base64data" } },
              ],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);
      const result = await client.generateImage({
        prompt: "a complex scene",
        thinkingConfig: {
          thinkingLevel: "HIGH",
          includeThoughts: true,
        },
      });

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body.generationConfig.thinkingConfig).toEqual({
        thinkingLevel: "HIGH",
        includeThoughts: true,
      });
      expect(result.thoughts).toBe("Thought process...");
      expect(result.description).toBe("Generated image description");
    });

    it("should not include imageConfig for non-image models", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: "base64data",
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

      const client = new GeminiImageClient(mockApiKey);
      await client.generateImage({
        prompt: "a cat",
        aspectRatio: "16:9",
        imageSize: "4K",
        model: "gemini-2.0-flash-exp",
      });

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body.generationConfig.imageConfig).toBeUndefined();
    });

    it("should reject invalid model names", async () => {
      const client = new GeminiImageClient(mockApiKey);

      await expect(
        client.generateImage({
          prompt: "test",
          model: "../../malicious-path",
        })
      ).rejects.toThrow("Invalid model");
    });

    it("should throw error on API failure", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);

      await expect(client.generateImage({ prompt: "test" })).rejects.toThrow(
        "Gemini API error (401): Unauthorized"
      );
    });

    it("should throw error when API returns error object", async () => {
      const mockResponse = {
        error: {
          code: 400,
          message: "Invalid request",
          status: "INVALID_ARGUMENT",
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);

      await expect(client.generateImage({ prompt: "test" })).rejects.toThrow(
        "Gemini API error: Invalid request"
      );
    });

    it("should throw error when no candidates returned", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);

      await expect(client.generateImage({ prompt: "test" })).rejects.toThrow(
        "No image generated - empty response from Gemini"
      );
    });

    it("should throw error when no image data in response", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "Just text, no image" }],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);

      await expect(client.generateImage({ prompt: "test" })).rejects.toThrow(
        "No image data in Gemini response"
      );
    });

    it("should handle response without description", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: "imagedata",
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

      const client = new GeminiImageClient(mockApiKey);
      const result = await client.generateImage({ prompt: "test" });

      expect(result).toEqual({
        mimeType: "image/jpeg",
        base64Data: "imagedata",
        description: undefined,
      });
    });
  });

  describe("describeImage", () => {
    it("should describe image with default prompt", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "A beautiful sunset over mountains" }],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);
      const result = await client.describeImage({
        images: [{ data: "base64data", mimeType: "image/png" }],
      });

      expect(result).toBe("A beautiful sunset over mountains");

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.generationConfig.responseModalities).toEqual(["TEXT"]);
    });

    it("should describe image with custom prompt", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "There are 5 people in this image" }],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);
      const result = await client.describeImage({
        images: [{ data: "base64data", mimeType: "image/png" }],
        prompt: "How many people are in this image?",
      });

      expect(result).toBe("There are 5 people in this image");

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.contents[0].parts[0].text).toBe("How many people are in this image?");
    });

    it("should throw error when no images provided", async () => {
      const client = new GeminiImageClient(mockApiKey);

      await expect(
        client.describeImage({ images: [] })
      ).rejects.toThrow("At least one image is required");
    });

    it("should throw error on API failure", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Server Error"),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);

      await expect(
        client.describeImage({
          images: [{ data: "base64data", mimeType: "image/png" }],
        })
      ).rejects.toThrow("Gemini API error (500)");
    });

    it("should throw error when no description returned", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [],
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const client = new GeminiImageClient(mockApiKey);

      await expect(
        client.describeImage({
          images: [{ data: "base64data", mimeType: "image/png" }],
        })
      ).rejects.toThrow("No description in Gemini response");
    });
  });
});
