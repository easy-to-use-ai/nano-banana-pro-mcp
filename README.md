# nano-banana-pro-mcp

<p align="center">
  <img src="https://raw.githubusercontent.com/easy-to-use-ai/nano-banana-pro-mcp/main/assets/cover.png" alt="Nano Banana Pro MCP Banner" width="100%">
</p>

<p align="center">
  <strong>🔥 Now supports Nano Banana 2 (<code>gemini-3.1-flash-image-preview</code>) — Google's latest and most capable image generation model</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@easyuseai/nano-banana-pro-mcp"><img src="https://img.shields.io/npm/v/@easyuseai/nano-banana-pro-mcp.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@easyuseai/nano-banana-pro-mcp"><img src="https://img.shields.io/npm/dm/@easyuseai/nano-banana-pro-mcp.svg" alt="npm downloads"></a>
  <a href="https://github.com/easy-to-use-ai/nano-banana-pro-mcp/blob/main/LICENSE"><img src="https://img.shields.io/github/license/easy-to-use-ai/nano-banana-pro-mcp.svg" alt="license"></a>
</p>

---

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that gives AI agents — Claude, Gemini, Codex and more — the power to **generate, edit, and analyze images** through Google's Gemini image generation API.

### Why Nano Banana 2?

**Nano Banana 2** (`gemini-3.1-flash-image-preview`) is Google's newest image generation model, bringing significant improvements over its predecessors:

- **Higher fidelity** — sharper details, better lighting/texture, reflective surfaces and dynamic scenes
- **Better instruction following** — more accurately interprets complex prompts and compositions
- **Native text rendering** — generates readable text within images, a major leap forward
- **2x faster, 50% cheaper** — API delivers ~2s/image, up to 350+ images/min at $0.067/image (1K)
- **14 aspect ratios** — new ultra-wide `8:1`, `4:1` and ultra-tall `1:8`, `1:4` for banners, panoramas, infographics
- **512px to 4K resolution** — new low-res `512px` option for fast iterations alongside `1K`, `2K`, `4K`
- **Google Search grounding** — real-time web search for accurate infographics, weather, products, and current events
- **Enhanced consistency** — maintains up to 5 characters and 14 objects across a single generation
- **Thinking mode** — optional deep reasoning for complex compositions and precise text rendering

> This MCP server defaults to Nano Banana 2, giving your AI agent access to Google's best image generation capabilities out of the box.

---

## Supported Models

| Model | Alias | Highlights |
|---|---|---|
| `gemini-3.1-flash-image-preview` | **Nano Banana 2** ⭐ | Latest & recommended. Best quality, text rendering, fast |
| `gemini-3-pro-image-preview` | Nano Banana Pro | Highest quality for complex scenes |
| `gemini-2.5-flash-preview-05-20` | Nano Banana | Balanced speed and quality |
| `gemini-2.0-flash-exp` | — | Widely available fallback |

---

## Quick Start

### 1. Get a Free API Key

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) — it's free.

### 2. Install

Choose your platform:

<details>
<summary><strong>Claude Code CLI</strong></summary>

```bash
claude mcp add nano-banana-pro --env GEMINI_API_KEY=your_api_key_here -- npx @easyuseai/nano-banana-pro-mcp
```
</details>

<details>
<summary><strong>Cursor</strong></summary>

Add to your Cursor MCP settings (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "nano-banana-pro": {
      "command": "npx",
      "args": ["@easyuseai/nano-banana-pro-mcp"],
      "env": {
        "GEMINI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to your config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nano-banana-pro": {
      "command": "npx",
      "args": ["@easyuseai/nano-banana-pro-mcp"],
      "env": {
        "GEMINI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```
</details>

<details>
<summary><strong>Codex CLI</strong></summary>

Create or edit `.mcp.json` in your project directory (or `~/.mcp.json` for global):

```json
{
  "mcpServers": {
    "nano-banana-pro": {
      "command": "npx",
      "args": ["@easyuseai/nano-banana-pro-mcp"],
      "env": {
        "GEMINI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```
</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

Create or edit `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "nano-banana-pro": {
      "command": "npx",
      "args": ["@easyuseai/nano-banana-pro-mcp"],
      "env": {
        "GEMINI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```
</details>

### 3. Use It

Just ask your AI agent to generate images — it will automatically use the MCP tools.

```
Generate a hero image of a sunset over Santorini, 16:9 aspect ratio, 4K

Generate an 8:1 ultra-wide banner of a modern cityscape in the style of 清明上河图

Generate today's weather infographic for Tokyo with Google Search enabled

Edit this photo: add a dramatic sky and warm color grading

Describe what's in this screenshot
```

---

## Tools

### `generate_image`

Generate an image from a text description. Optionally provide reference images for style/content guidance.

| Parameter | Required | Description |
|---|---|---|
| `prompt` | ✅ | Text description of the image to generate |
| `model` | | Gemini model (default: `gemini-3.1-flash-image-preview`) |
| `aspectRatio` | | `1:1` · `3:2` · `2:3` · `3:4` · `4:3` · `4:5` · `5:4` · `9:16` · `16:9` · `21:9` · `4:1` · `1:4` · `8:1` · `1:8` |
| `imageSize` | | `512px` · `1K` · `2K` · `4K` |
| `images` | | Reference images `[{ data, mimeType }]` (up to 10 object + 4 person refs) |
| `outputPath` | | File path to save the image |
| `useGoogleSearch` | | Enable real-time web search for grounded generation (default: `false`) |
| `personGeneration` | | `ALLOW_ALL` · `ALLOW_ADULT` · `ALLOW_NONE` |
| `thinkingConfig` | | `{ thinkingLevel, includeThoughts }` for complex scenes |

### `edit_image`

Edit one or more existing images based on instructions.

| Parameter | Required | Description |
|---|---|---|
| `prompt` | ✅ | Editing instructions |
| `images` | ✅ | Images to edit `[{ data, mimeType }]` |
| `model` | | Gemini model (default: `gemini-3.1-flash-image-preview`) |
| `outputPath` | | File path to save the result |
| `personGeneration` | | `ALLOW_ALL` · `ALLOW_ADULT` · `ALLOW_NONE` |

### `describe_image`

Analyze and describe images. Returns text only.

| Parameter | Required | Description |
|---|---|---|
| `images` | ✅ | Images to analyze `[{ data, mimeType }]` |
| `prompt` | | Custom analysis prompt |
| `model` | | Gemini model (default: `gemini-3.1-flash-image-preview`) |

---

## Prompt Templates

The server includes **10 built-in prompt templates** showcasing best practices and creative workflows with Nano Banana 2's new features. AI agents can discover and use these via the MCP prompts protocol.

| # | Prompt | Key Features Used | Use Case |
|---|---|---|---|
| 1 | `ultra_wide_panorama` | 8:1 ratio | Website banners, outdoor ads, wall art |
| 2 | `weather_infographic` | Google Search | Real-time weather data visualization |
| 3 | `ecommerce_banner` | 4:1 ratio | Product promotion banners |
| 4 | `product_detail_long` | 1:4 ratio, Thinking | Mobile product detail pages |
| 5 | `scroll_painting_panorama` | 8:1 ratio, Thinking | Chinese scroll painting style cityscapes |
| 6 | `resize_and_enhance` | Flexible ratio | Resize & upscale existing images |
| 7 | `character_multi_scene` | Consistency | Same character across multiple scenes |
| 8 | `knowledge_card` | Google Search, Thinking | Illustrated species / knowledge cards |
| 9 | `comic_storyboard` | Thinking, Consistency | Multi-panel comic storyboards |
| 10 | `brand_logo_system` | 4K, Thinking | Brand logo & visual identity design |

### Example Usage

With Claude Desktop or any MCP-compatible client, you can select a prompt template and fill in the parameters:

```
Use the "scroll_painting_panorama" prompt:
  city: Hangzhou
  variant: ghibli
  resolution: 4K
```

---

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm test             # Run unit tests
npm run test:watch   # Tests in watch mode
npm run typecheck    # Type check only
```

### Manual Testing

```bash
GEMINI_API_KEY=your_key npm run test:manual "a cute cat wearing sunglasses"
```

### MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## License

MIT
