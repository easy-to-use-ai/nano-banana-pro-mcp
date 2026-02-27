export type AspectRatio =
  | "1:1"
  | "3:2" | "2:3"
  | "3:4" | "4:3"
  | "4:5" | "5:4"
  | "9:16" | "16:9"
  | "21:9"
  | "4:1" | "1:4"
  | "8:1" | "1:8";

export type ImageSize = "512px" | "1K" | "2K" | "4K";

export type PersonGeneration = "ALLOW_ALL" | "ALLOW_ADULT" | "ALLOW_NONE";

export interface GeminiImageConfig {
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  personGeneration?: PersonGeneration;
}

export interface ThinkingConfig {
  thinkingLevel?: "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";
  includeThoughts?: boolean;
}

export interface GeminiRequest {
  contents: Array<{
    parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;
  }>;
  generationConfig: {
    responseModalities: string[];
    imageConfig?: GeminiImageConfig;
    thinkingConfig?: ThinkingConfig;
  };
  tools?: Array<{ google_search: Record<string, never> }>;
}

export interface GeminiResponsePart {
  text?: string;
  thought?: boolean;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: GeminiResponsePart[];
    };
    groundingMetadata?: {
      searchEntryPoint?: { renderedContent: string };
      groundingChunks?: Array<{ web?: { uri: string; title: string } }>;
      webSearchQueries?: string[];
    };
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

export interface ImageInput {
  data: string;      // base64 encoded image data
  mimeType: string;  // e.g., "image/png", "image/jpeg"
}

export interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  model?: string;
  images?: ImageInput[];
  personGeneration?: PersonGeneration;
  useGoogleSearch?: boolean;
  thinkingConfig?: ThinkingConfig;
}

export interface GeneratedImage {
  mimeType: string;
  base64Data: string;
  description?: string;
  thoughts?: string;
  searchQueries?: string[];
}

export interface DescribeImageOptions {
  images: ImageInput[];
  prompt?: string;
  model?: string;
}
