interface PromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

interface PromptDefinition {
  name: string;
  title: string;
  description: string;
  arguments: PromptArgument[];
  buildMessages: (args: Record<string, string>) => Array<{
    role: "user" | "assistant";
    content: { type: "text"; text: string };
  }>;
}

export const IMAGE_PROMPTS: PromptDefinition[] = [
  // ── 1. 超宽幅城市全景 ─────────────────────────────────
  {
    name: "ultra_wide_panorama",
    title: "Ultra-Wide City Panorama",
    description: "Generate an 8:1 ultra-wide panoramic cityscape — perfect for website banners, outdoor ads, and immersive wall art. Uses the Nano Banana 2 exclusive 8:1 aspect ratio.",
    arguments: [
      { name: "city", description: "City name (e.g., Shanghai, Tokyo, New York)", required: true },
      { name: "style", description: "Art style (e.g., photorealistic, watercolor, cyberpunk, ink wash)" },
      { name: "time_of_day", description: "Time of day (e.g., sunrise, golden hour, night)" },
      { name: "resolution", description: "Resolution: 512px, 1K, 2K, or 4K (default: 2K)" },
    ],
    buildMessages: (args) => {
      const city = args.city || "Shanghai";
      const style = args.style || "photorealistic aerial photography";
      const time = args.time_of_day || "golden hour";
      const resolution = args.resolution || "2K";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "An ultra-wide panoramic view of ${city}'s iconic landmarks and skyline during ${time}, rendered in ${style} style. Seamless composition from left to right, rich in architectural details, with natural depth and atmospheric perspective."
- aspectRatio: "8:1"
- imageSize: "${resolution}"`,
        },
      }];
    },
  },

  // ── 2. 实时天气信息图 ─────────────────────────────────
  {
    name: "weather_infographic",
    title: "Real-Time Weather Infographic",
    description: "Generate a weather infographic with real-time data via Google Search grounding. The model searches for current weather conditions before generating an accurate visual.",
    arguments: [
      { name: "city", description: "City name (e.g., Beijing, San Francisco)", required: true },
      { name: "language", description: "Display language (e.g., Chinese, English, Japanese)" },
      { name: "days", description: "Forecast range (e.g., today, 3-day, 5-day, 7-day)" },
    ],
    buildMessages: (args) => {
      const city = args.city || "Beijing";
      const lang = args.language || "Chinese";
      const days = args.days || "5-day";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "Design a modern, visually appealing ${days} weather forecast infographic for ${city}. Include temperature highs/lows, weather icons, humidity, wind speed, and daily clothing recommendations. Use a clean card-based layout with soft gradients. All text in ${lang}."
- aspectRatio: "9:16"
- imageSize: "2K"
- useGoogleSearch: true`,
        },
      }];
    },
  },

  // ── 3. 电商横幅 Banner ─────────────────────────────────
  {
    name: "ecommerce_banner",
    title: "E-Commerce Product Banner",
    description: "Generate a 4:1 wide-format product promotion banner — ideal for website hero sections, marketplace headers, and email campaigns.",
    arguments: [
      { name: "product", description: "Product name and brief description", required: true },
      { name: "promotion", description: "Promotion text (e.g., Summer Sale 50% Off)" },
      { name: "color_theme", description: "Color theme (e.g., red and gold, minimalist white, dark luxury)" },
      { name: "resolution", description: "Resolution: 512px, 1K, 2K, or 4K (default: 2K)" },
    ],
    buildMessages: (args) => {
      const product = args.product || "wireless headphones";
      const promotion = args.promotion || "New Arrival";
      const color = args.color_theme || "modern gradient";
      const resolution = args.resolution || "2K";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "Professional e-commerce banner for ${product}. Promotion text '${promotion}' prominently displayed with elegant typography. ${color} color scheme, high-end product photography style, clean composition with the product as the focal point, surrounded by subtle decorative elements."
- aspectRatio: "4:1"
- imageSize: "${resolution}"`,
        },
      }];
    },
  },

  // ── 4. 竖版产品详情长图 ────────────────────────────────
  {
    name: "product_detail_long",
    title: "Vertical Product Detail Page",
    description: "Generate a 1:4 ultra-tall vertical layout — perfect for mobile product detail pages, Instagram story sequences, and scrollable infographics.",
    arguments: [
      { name: "product", description: "Product name and key features", required: true },
      { name: "sections", description: "Number of visual sections (e.g., 3, 4, 5)" },
      { name: "style", description: "Visual style (e.g., Apple minimalist, vibrant lifestyle, technical blueprint)" },
    ],
    buildMessages: (args) => {
      const product = args.product || "smart watch";
      const sections = args.sections || "4";
      const style = args.style || "Apple minimalist";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "A vertical product detail page for ${product}, divided into ${sections} visual sections flowing from top to bottom. ${style} design language. Section 1: Hero shot with product name. Remaining sections: key features with icons and brief text labels. Consistent color palette and typography throughout. Clean white background with subtle shadows."
- aspectRatio: "1:4"
- imageSize: "2K"
- thinkingConfig: {"thinkingLevel": "HIGH"}`,
        },
      }];
    },
  },

  // ── 5. 清明上河图风格全景画 ─────────────────────────────
  {
    name: "scroll_painting_panorama",
    title: "Chinese Scroll Painting Panorama",
    description: "Generate an 8:1 ultra-wide scene inspired by classic Chinese horizontal scroll paintings — reimagining modern cities in the style of 'Along the River During the Qingming Festival'.",
    arguments: [
      { name: "city", description: "City name to reimagine (e.g., Chengdu, Hangzhou, Chongqing)", required: true },
      { name: "variant", description: "Style variant: ink-wash, ghibli, pixel-art, or traditional (default: traditional)" },
      { name: "resolution", description: "Resolution: 1K, 2K, or 4K (default: 2K)" },
    ],
    buildMessages: (args) => {
      const city = args.city || "Hangzhou";
      const variant = args.variant || "traditional";
      const resolution = args.resolution || "2K";
      const styleMap: Record<string, string> = {
        traditional: "traditional Chinese ink wash and color painting style, inspired by Along the River During the Qingming Festival (清明上河图)",
        "ink-wash": "monochrome Chinese ink wash (水墨画) style with dynamic brush strokes",
        ghibli: "Studio Ghibli animation style with warm colors and whimsical details",
        "pixel-art": "detailed pixel art style with retro charm",
      };
      const styleDesc = styleMap[variant] || styleMap.traditional;
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "An ultra-wide panoramic depiction of modern ${city} and its famous landmarks, rendered in ${styleDesc}. Show bustling street life, local architecture, signature food stalls, cultural landmarks, and natural scenery seamlessly flowing from one scene to the next. Rich in detail, with tiny characters going about their daily lives."
- aspectRatio: "8:1"
- imageSize: "${resolution}"
- thinkingConfig: {"thinkingLevel": "HIGH"}`,
        },
      }];
    },
  },

  // ── 6. 一键改画幅 + 超分辨率 ───────────────────────────
  {
    name: "resize_and_enhance",
    title: "Resize & Enhance Image",
    description: "Intelligently resize an existing image to a new aspect ratio while preserving content structure, and optionally upscale resolution. Great for adapting content across platforms.",
    arguments: [
      { name: "target_ratio", description: "Target aspect ratio (e.g., 16:9, 9:16, 4:1, 1:1)", required: true },
      { name: "target_resolution", description: "Target resolution: 512px, 1K, 2K, or 4K (default: 2K)" },
      { name: "language", description: "If the image has text, translate to this language (e.g., Chinese, English)" },
      { name: "additional_instructions", description: "Any additional editing instructions" },
    ],
    buildMessages: (args) => {
      const ratio = args.target_ratio || "16:9";
      const resolution = args.target_resolution || "2K";
      const langNote = args.language ? `, translate all visible text to ${args.language}` : "";
      const extra = args.additional_instructions ? `. Also: ${args.additional_instructions}` : "";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the edit_image tool (the user should provide a reference image). Apply these parameters:
- prompt: "Resize this image to ${ratio} aspect ratio. Maintain the original composition, visual style, all UI elements, and content structure. Extend or crop intelligently to fill the new canvas without distortion${langNote}${extra}. Output in ${resolution} resolution."

The user needs to provide their image as a reference. After receiving it, call the generate_image tool with:
- The user's image in the images array
- aspectRatio: "${ratio}"
- imageSize: "${resolution}"`,
        },
      }];
    },
  },

  // ── 7. 角色一致性多场景 ────────────────────────────────
  {
    name: "character_multi_scene",
    title: "Character Consistency Multi-Scene",
    description: "Generate images of a consistent character across multiple scenes — ideal for storyboards, comics, social media series, and virtual influencer content.",
    arguments: [
      { name: "character_description", description: "Detailed character description (appearance, clothing, features)", required: true },
      { name: "scenes", description: "Comma-separated scene descriptions (e.g., park, library, cafe, train station)", required: true },
      { name: "style", description: "Art style (e.g., anime, photorealistic, watercolor, comic)" },
    ],
    buildMessages: (args) => {
      const character = args.character_description || "a young woman with short black hair, wearing a white blouse and navy skirt";
      const scenes = (args.scenes || "park, library, cafe").split(",").map(s => s.trim());
      const style = args.style || "photorealistic";
      const sceneList = scenes.map((s, i) => `Scene ${i + 1}: ${s}`).join("; ");
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Generate ${scenes.length} images with a consistent character across different scenes. Use the generate_image tool for each scene.

Character: ${character}
Style: ${style}
Scenes: ${sceneList}

For each scene, use:
- prompt: "A ${style} image of ${character}, in [scene location]. The character's appearance, clothing, hairstyle, and facial features must remain exactly consistent. [Scene-specific details and atmosphere]."
- aspectRatio: "16:9"
- imageSize: "2K"

IMPORTANT: Generate each scene one by one to maintain consistency. Reference the character description precisely in every prompt.`,
        },
      }];
    },
  },

  // ── 8. 搜索增强知识图鉴 ────────────────────────────────
  {
    name: "knowledge_card",
    title: "Search-Grounded Knowledge Card",
    description: "Generate a beautiful illustrated knowledge card / species profile with real-time search data — perfect for educational content, nature guides, and encyclopedia entries.",
    arguments: [
      { name: "subject", description: "Subject to illustrate (e.g., Yellow-rumped Warbler, Giant Panda, Monarch Butterfly)", required: true },
      { name: "card_type", description: "Card type: species, landmark, food, or general (default: species)" },
      { name: "language", description: "Display language (default: Chinese)" },
    ],
    buildMessages: (args) => {
      const subject = args.subject || "Monarch Butterfly";
      const cardType = args.card_type || "species";
      const lang = args.language || "Chinese";
      const layoutMap: Record<string, string> = {
        species: "Include: scientific name, habitat, diet, conservation status, size comparison, and distribution map icon. Main illustration should be a detailed realistic portrait in its natural habitat.",
        landmark: "Include: location, history highlights, visiting tips, architectural style, and a fun fact. Main illustration should be a beautiful scenic view.",
        food: "Include: origin, key ingredients, nutrition facts, flavor profile, and preparation time. Main illustration should be an appetizing food photography style shot.",
        general: "Include: key facts, interesting trivia, related topics, and a timeline if applicable. Main illustration should be visually engaging and informative.",
      };
      const layout = layoutMap[cardType] || layoutMap.general;
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "Design an illustrated knowledge card about ${subject}. ${layout} Use a clean, modern infographic layout with a primary illustration taking up the top half and organized fact sections below. All text in ${lang}. Style: scientific illustration meets modern flat design."
- aspectRatio: "3:4"
- imageSize: "2K"
- useGoogleSearch: true
- thinkingConfig: {"thinkingLevel": "HIGH"}`,
        },
      }];
    },
  },

  // ── 9. 漫画分镜故事板 ──────────────────────────────────
  {
    name: "comic_storyboard",
    title: "Comic / Storyboard Panels",
    description: "Generate a multi-panel comic storyboard with consistent characters and a cohesive narrative — great for webcomics, pitch decks, and creative projects.",
    arguments: [
      { name: "story", description: "Brief story outline or scenario description", required: true },
      { name: "panels", description: "Number of panels (e.g., 4, 6, 8, default: 6)" },
      { name: "style", description: "Comic style (e.g., manga, Marvel, European BD, ink-wash, minimalist)" },
      { name: "character", description: "Main character description for consistency" },
    ],
    buildMessages: (args) => {
      const story = args.story || "A robot discovers a garden in an abandoned city";
      const panels = args.panels || "6";
      const style = args.style || "manga";
      const character = args.character || "the main character";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "A ${panels}-panel ${style} comic storyboard. Story: ${story}. Main character: ${character}. Layout: ${panels} panels arranged in a grid on a single page, each panel clearly bordered. The panels should tell the story sequentially with varied compositions (close-up, wide shot, action, dialogue). Maintain consistent character design and art style across all panels. Include minimal dialogue text bubbles."
- aspectRatio: "3:4"
- imageSize: "2K"
- thinkingConfig: {"thinkingLevel": "HIGH"}`,
        },
      }];
    },
  },

  // ── 10. 品牌 Logo 及视觉系统 ───────────────────────────
  {
    name: "brand_logo_system",
    title: "Brand Logo & Visual Identity",
    description: "Generate a brand logo with visual identity explorations — including logo, color palette, typography suggestion, and mockup applications. Uses thinking mode for precise design.",
    arguments: [
      { name: "brand_name", description: "Brand / company name", required: true },
      { name: "industry", description: "Industry or domain (e.g., tech startup, organic food, fitness app)" },
      { name: "keywords", description: "Design keywords (e.g., modern, playful, premium, eco-friendly)" },
      { name: "icon_idea", description: "Icon concept hint (e.g., a leaf, abstract wave, geometric bird)" },
    ],
    buildMessages: (args) => {
      const brand = args.brand_name || "TechFlow";
      const industry = args.industry || "tech startup";
      const keywords = args.keywords || "modern, clean, innovative";
      const icon = args.icon_idea ? `Icon concept: ${args.icon_idea}. ` : "";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "Design a comprehensive brand identity sheet for '${brand}', a ${industry} brand. ${icon}Style keywords: ${keywords}. The sheet should include: (1) Primary logo - clean and scalable, (2) Logo icon/mark standalone, (3) Color palette with 4-5 hex color swatches, (4) Typography pairing suggestion with sample text, (5) Two mockup applications (business card and app icon). Arrange everything on a clean white presentation board with subtle grid lines. The brand name '${brand}' must be rendered clearly and correctly."
- aspectRatio: "4:3"
- imageSize: "4K"
- thinkingConfig: {"thinkingLevel": "HIGH"}`,
        },
      }];
    },
  },
];
