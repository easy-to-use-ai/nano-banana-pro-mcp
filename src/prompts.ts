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

  // ── 11. 火柴人白板信息图 ───────────────────────────────
  {
    name: "whiteboard_infographic",
    title: "Whiteboard Stickman Infographic",
    description: "Generate an 'expert whiteboard teaching' style infographic with marker-drawn diagrams, stickman instructor, and clean visual hierarchy — perfect for article illustrations, tutorials, and social media explainers.",
    arguments: [
      { name: "topic", description: "Topic or content to visualize (e.g., 'How HTTP works', 'Machine Learning pipeline')", required: true },
      { name: "language", description: "Text language: Chinese, English, or bilingual (default: bilingual)" },
      { name: "density", description: "Information density: sparse, moderate, or dense (default: moderate)" },
    ],
    buildMessages: (args) => {
      const topic = args.topic || "How AI image generation works";
      const lang = args.language || "bilingual Chinese and English";
      const density = args.density || "moderate";
      const densityNote = density === "dense"
        ? "Pack more details and data points into the diagram, minimal whitespace."
        : density === "sparse"
          ? "Keep very loose with 40%+ whitespace, only key concepts."
          : "Maintain 30%+ whitespace, balance between detail and clarity.";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "Expert whiteboard teaching style infographic about '${topic}'. Clean white whiteboard or light gray grid paper background. Use marker-drawn lines, arrows, and boxes to build a flowchart or mind map. A simple stickman instructor in the corner pointing at key data. Title in bold handwritten style, body text as concise keywords using different colored markers (red, blue, black) to highlight priorities. ${densityNote} All text in ${lang}. Hand-drawn sketch aesthetic with marker pen texture."
- aspectRatio: "16:9"
- imageSize: "2K"`,
        },
      }];
    },
  },

  // ── 12. 极简负空间封面设计 ──────────────────────────────
  {
    name: "minimalist_cover",
    title: "Minimalist Negative Space Cover",
    description: "Generate a minimalist negative space cover design with bold silhouette and limited colors — ideal for notebook covers, book jackets, brand stationery, and merchandise.",
    arguments: [
      { name: "subject", description: "Subject silhouette (e.g., flying bird, cat, mountain, flower)", required: true },
      { name: "subject_color", description: "Color of the silhouette (e.g., white, black, red)" },
      { name: "background_color", description: "Background color (e.g., deep green, navy blue, orange)" },
      { name: "text", description: "Optional text to integrate into the design (e.g., a short phrase or title)" },
    ],
    buildMessages: (args) => {
      const subject = args.subject || "flying bird";
      const subjectColor = args.subject_color || "white";
      const bgColor = args.background_color || "deep teal";
      const textNote = args.text ? ` The text '${args.text}' is cleverly integrated into the design composition.` : "";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "Minimalist negative space design, ${subjectColor} ${subject} silhouette, ${bgColor} background. Flat vector illustration style, high contrast, clean composition, simple and elegant, modern graphic design. Use only 2-3 colors. Asymmetric layout, generous whitespace, sharp edges. Professional notebook cover design.${textNote}"
- aspectRatio: "3:4"
- imageSize: "2K"`,
        },
      }];
    },
  },

  // ── 13. 竖版条漫 ──────────────────────────────────────
  {
    name: "vertical_comic_strip",
    title: "Vertical Comic Strip (9:16)",
    description: "Generate a 9:16 vertical comic strip with sequential panels flowing top to bottom — ideal for Webtoon-style comics, social media stories, and mobile-first content.",
    arguments: [
      { name: "story", description: "Story outline with panel descriptions", required: true },
      { name: "panels", description: "Number of panels (e.g., 4, 6, 8, default: 6)" },
      { name: "style", description: "Art style (e.g., Q-version cute, manga, chibi, pixel-art)" },
      { name: "language", description: "Dialogue language (default: Chinese)" },
    ],
    buildMessages: (args) => {
      const story = args.story || "A day in the life of an office worker: alarm, subway, lunch, drowning in emails, moonlit exit, phone in bed";
      const panels = args.panels || "6";
      const style = args.style || "Q-version cute chibi";
      const lang = args.language || "Chinese";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "A ${panels}-panel vertical comic strip, ${style} art style. Story: ${story}. Panels flow from top to bottom in a single 9:16 vertical image. Each panel has a different pastel/macaron background color. Include speech bubbles with ${lang} dialogue. Characters maintain consistent design across all panels. Mix cute expressions with humorous scenes. Clear panel borders."
- aspectRatio: "9:16"
- imageSize: "2K"
- thinkingConfig: {"thinkingLevel": "HIGH"}`,
        },
      }];
    },
  },

  // ── 14. 电商产品套图 ──────────────────────────────────
  {
    name: "ecommerce_product_suite",
    title: "E-Commerce Product Image Suite",
    description: "Generate a complete set of product display images for e-commerce — main image, lifestyle scene, feature callouts, and size/scale reference. Upload a product photo as reference.",
    arguments: [
      { name: "product", description: "Product name and type (e.g., artisan perfume, wireless earbuds)", required: true },
      { name: "selling_points", description: "Key selling points to highlight (e.g., natural ingredients, 40-hour battery)", required: true },
      { name: "scene", description: "Lifestyle scene context (e.g., modern bathroom, outdoor adventure)" },
      { name: "style", description: "Photography style (e.g., luxury minimalist, warm lifestyle, studio white)" },
    ],
    buildMessages: (args) => {
      const product = args.product || "artisan perfume";
      const points = args.selling_points || "natural botanical extracts, long-lasting fragrance, handcrafted glass bottle";
      const scene = args.scene || "an elegant vanity table with soft morning light";
      const style = args.style || "luxury minimalist";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Generate a suite of e-commerce product images for ${product}. Use the generate_image tool for each of the following shots:

**Shot 1 — Hero Main Image** (white background, product centered):
- prompt: "${style} product photography of ${product} on pure white background. Studio lighting, sharp details, slight shadow for depth. Clean and professional, suitable as the main listing image."
- aspectRatio: "1:1"
- imageSize: "2K"

**Shot 2 — Lifestyle Scene** (product in context):
- prompt: "${product} placed in ${scene}. ${style} photography, natural lighting, shallow depth of field. The product is the clear focal point with complementary props."
- aspectRatio: "1:1"
- imageSize: "2K"

**Shot 3 — Feature Callout** (key selling points annotated):
- prompt: "Product feature infographic for ${product}. Clean layout showing the product with labeled callout lines pointing to key features: ${points}. Modern minimalist design with icons and brief text labels. White background."
- aspectRatio: "1:1"
- imageSize: "2K"

If the user has a reference product photo, include it in the images array for each call.`,
        },
      }];
    },
  },

  // ── 15. 品牌盲盒微缩小店 ──────────────────────────────
  {
    name: "blindbox_miniature_store",
    title: "Brand Blind Box Miniature Store",
    description: "Generate a 3D Q-version miniature store scene in blind box/figurine aesthetic — perfect for brand social media, fan merchandise concepts, and marketing campaigns.",
    arguments: [
      { name: "brand", description: "Brand or store name and type (e.g., 'Starbucks coffee shop', 'Nintendo game store')", required: true },
      { name: "details", description: "Specific scene details (e.g., exterior style, window display, characters outside)" },
      { name: "color_mood", description: "Color mood (e.g., warm afternoon, pastel spring, neon night)" },
    ],
    buildMessages: (args) => {
      const brand = args.brand || "a cozy bookstore cafe";
      const details = args.details || "Two-story mini building with large glass windows showing bookshelves and coffee bar inside. Q-version characters browsing books and sipping coffee outside.";
      const mood = args.color_mood || "warm afternoon sunlight";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "3D Q-version miniature scene of ${brand}, blind box figurine aesthetic, Cinema 4D rendering quality. ${details} Soft ${mood} lighting, warm tones, macro photography-like shallow depth of field. The mini building is a detailed two-story structure. All characters are chibi-style with big heads, small bodies, PVC matte material finish. Highly detailed miniature world, tilt-shift effect."
- aspectRatio: "1:1"
- imageSize: "2K"
- thinkingConfig: {"thinkingLevel": "HIGH"}`,
        },
      }];
    },
  },

  // ── 16. 超长历史/产品时间线 ─────────────────────────────
  {
    name: "timeline_illustration",
    title: "Ultra-Long Timeline Illustration",
    description: "Generate an 8:1 or 1:8 ultra-long timeline illustration — ideal for historical timelines, product evolution, company milestones, and educational content.",
    arguments: [
      { name: "subject", description: "Timeline subject (e.g., 'Chinese dynasties from Xia to 2026', 'Evolution of smartphones')", required: true },
      { name: "orientation", description: "horizontal (8:1) or vertical (1:8), default: horizontal" },
      { name: "style", description: "Visual style (e.g., illustrated infographic, ink wash to modern gradient, flat design)" },
      { name: "language", description: "Label language (default: Chinese)" },
    ],
    buildMessages: (args) => {
      const subject = args.subject || "Chinese dynasties from Xia to 2026";
      const orientation = args.orientation || "horizontal";
      const ratio = orientation === "vertical" ? "1:8" : "8:1";
      const flowDir = orientation === "vertical" ? "top to bottom" : "left to right";
      const style = args.style || "illustrated infographic with color gradient from ancient bronze tones to modern vivid colors";
      const lang = args.language || "Chinese";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "An ultra-long timeline illustration of ${subject}. Flowing ${flowDir}, each era/milestone represented by its most iconic visual element. ${style}. A continuous river/path serves as the time axis with labeled dates and milestones in ${lang}. Rich in detail with miniature scenes at each milestone point. Seamless transitions between periods."
- aspectRatio: "${ratio}"
- imageSize: "2K"
- thinkingConfig: {"thinkingLevel": "HIGH"}`,
        },
      }];
    },
  },

  // ── 17. 一城一味一句话 ─────────────────────────────────
  {
    name: "city_food_culture_card",
    title: "City × Food × Culture Fusion Card",
    description: "Generate a 3D isometric miniature scene fusing a city's landmark, signature food, and local culture into one card — perfect for travel promotion, city IP branding, and cultural content.",
    arguments: [
      { name: "city", description: "City name (e.g., Chengdu, Guangzhou, Tokyo)", required: true },
      { name: "food", description: "Signature food (e.g., hotpot, dim sum, ramen)" },
      { name: "landmark", description: "City landmark (e.g., Wide and Narrow Alleys, Canton Tower)" },
      { name: "slogan", description: "Local slogan or dialect phrase to display in a speech bubble" },
    ],
    buildMessages: (args) => {
      const city = args.city || "Chengdu";
      const food = args.food || "boiling red-oil hotpot";
      const landmark = args.landmark || "Wide and Narrow Alleys";
      const slogan = args.slogan || "";
      const sloganNote = slogan ? ` A speech bubble at the top reads '${slogan}'.` : "";
      return [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please use the generate_image tool with these parameters:
- prompt: "3D isometric miniature scene of ${city}. A tiny city block model sitting on a surface, featuring a miniature ${landmark} as the centerpiece, with a giant ${food} as a prominent element. Q-version chibi characters are eating, walking, and enjoying the scene. Warm soft lighting, blind box figurine aesthetic, PVC matte material texture.${sloganNote} Highly detailed, tilt-shift photography effect, Cinema 4D rendering quality."
- aspectRatio: "1:1"
- imageSize: "2K"
- thinkingConfig: {"thinkingLevel": "HIGH"}`,
        },
      }];
    },
  },
];
