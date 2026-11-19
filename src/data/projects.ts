import type { ImageMetadata } from "astro";

/**
 * Portfolio content. Edit copy here; layout lives in src/pages/projects/.
 *
 * Images live in src/assets/projects/<slug>/. Reference them by filename
 * (without extension) with img("slug", "name"). A project with no `hero`
 * shows a placeholder, and one with an empty `gallery` hides the gallery.
 */

const images = import.meta.glob<ImageMetadata>(
  "../assets/projects/**/*.{webp,png,jpg,jpeg}",
  { eager: true, import: "default" },
);

function img(slug: string, name: string): ImageMetadata {
  const match = Object.entries(images).find(([path]) =>
    /\.(webp|png|jpe?g)$/.test(path) &&
    path.replace(/\.[^.]+$/, "").endsWith(`/projects/${slug}/${name}`),
  );
  if (!match) throw new Error(`Missing project image: ${slug}/${name}`);
  return match[1];
}

export interface GalleryItem {
  image: ImageMetadata;
  alt: string;
  caption: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  category: string;
  year: string;
  role: string;
  status: string;
  links: {
    live?: { url: string; label: string };
    repo?: { url: string; isPrivate: boolean };
  };
  hero?: ImageMetadata;
  heroAlt: string;
  accent: string;
  metrics: { value: string; label: string }[];
  star: {
    situation: string;
    task: string;
    action: string[];
    result: string[];
  };
  flow: { title: string; steps: { title: string; body: string }[] };
  decisions: { title: string; body: string }[];
  stack: { group: string; items: string[] }[];
  gallery: GalleryItem[];
  galleryNote?: string;
  limits: { title: string; items: string[] };
}

const ROLE =
  "Product design, architecture, testing and review. Built with an AI pair programmer.";

export const projects: Project[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "counselai",
    name: "CounselAI",
    tagline:
      "A voice AI intake agent for law firms, built with the testing and grading to prove it behaves.",
    summary:
      "Paste a law firm's website and get a working phone and chat intake agent. A built-in simulator and a hand-calibrated judge grade every call, so each change to the agent shows up as a measurable difference.",
    category: "AI voice agent · Evaluation",
    year: "2026",
    role: ROLE,
    status: "Portfolio build",
    links: {
      repo: { url: "https://github.com/louisiaegerv/CounselAI", isPrivate: true },
    },
    hero: img("counselai", "hero"),
    heroAlt:
      "CounselAI: a phone showing a live intake call beside the dashboard's call transcript, extracted facts and booked consultation.",
    accent: "#8a2a3b",
    metrics: [
      { value: "7 / 7", label: "planted compliance violations caught, with no false alarms" },
      { value: "1.65 s", label: "median phone reply wait, down from 3.2 s" },
      { value: "~$0.03", label: "to run a full 12-caller test suite" },
      { value: "30", label: "real conversations hand-scored to calibrate the judge" },
    ],
    star: {
      situation:
        "Intake is the first moment a law firm wins or loses a client, but most AI voice demos stop at \"it answered the phone.\" A firm's attorney can't trust an agent they can't audit, and a language model asked to decide who qualifies can be talked into the wrong answer by a persistent caller.",
      task:
        "Build an intake agent that can be set up from nothing but a firm's website, and prove that it behaves: qualifies callers consistently, never gives legal advice, never invents firm facts, and is cheap enough to test constantly.",
      action: [
        "Built a pipeline that crawls the firm's site (rendering script-heavy pages in a headless browser when needed), drafts a configuration, and shows every field beside the quote it came from. Each quote is re-checked against the crawled text in code before the field is trusted.",
        "Separated conversation from judgment. The model only collects facts; a deterministic rules engine decides who qualifies. The prompt never contains the rules, and booking is enforced in the tool handlers too, so even a prompt-injected agent cannot book an unqualified caller.",
        "Put one agent engine behind every channel (text console, simulator, Retell phone line, and a self-hosted LiveKit path) so a test run exercises exactly what a real call does.",
        "Built the Lab: synthetic callers written from each firm's own configuration, code-based pass/fail on outcome and facts, and an LLM judge for empathy and compliance where every score and flag must quote the transcript (verified in code).",
        "Calibrated the judge against myself: scored 30 conversations blind, planted 9 known violations, and wrote 6 calls that are weak in exactly one way. I versioned the rubric after finding two flaws in the first one.",
        "Cut phone latency by keeping call state in memory, saving to the database behind the reply, and drafting the reply in parallel with the model's tool step.",
      ],
      result: [
        "The judge caught 7 of 7 planted compliance violations and raised no flag on any clean test call or any of the 30 real ones.",
        "Median wait after a caller finishes speaking fell from 3.2 s to 1.65 s across three real phone calls.",
        "A full twelve-caller Lab run costs about three cents, so every prompt or rule change can be tested before it ships.",
        "An honest finding: judge scores land within a point of mine about 75% of the time, but my own scores bunch at 8 and 9. I use them to compare runs against the same callers, not as an absolute measure of quality.",
      ],
    },
    flow: {
      title: "How it works",
      steps: [
        { title: "Crawl and extract", body: "One URL in. The site is crawled, chunked and embedded, and a draft configuration is extracted with source quotes." },
        { title: "Human review", body: "Every flagged field says why, shows its quote, and must be marked reviewed before Publish unlocks." },
        { title: "Publish", body: "The prompt and tool list are stored with each published version, so a code change never alters a live agent." },
        { title: "Take the call", body: "Phone, chat, or an automated callback from the firm's contact form. All three run the same engine." },
        { title: "Grade", body: "Code decides pass or fail. A judge model scores quality and flags compliance problems, quoting the transcript." },
        { title: "Improve", body: "Change a rule or prompt, rerun the synthetic callers, and watch the pass rate move." },
      ],
    },
    decisions: [
      {
        title: "Rules decide. The model collects facts.",
        body: "A model asked to qualify a caller will sometimes be talked into the wrong answer, and an outcome I can't reproduce is one I can't audit. The qualification engine is plain code, and \"I don't know\" only ever sends a call to review.",
      },
      {
        title: "A judge is only evidence if it's checked.",
        body: "I scored calls blind, planted violations, and kept every verdict beside the rubric version that produced it. That is how I found that version 1 graded against an imagined ideal call instead of what each call needed.",
      },
      {
        title: "Retrieval is for facts about the firm, nothing else.",
        body: "Hours, fees and offices come from the crawled site, and the agent is told to say it doesn't know rather than guess. Declined callers only ever hear referrals the firm itself wrote down.",
      },
      {
        title: "Portable by design, honest about tradeoffs.",
        body: "Retell is the default. A self-hosted LiveKit path with local speech models runs the same engine and has taken a real call, but waits were about 4 s against Retell's 1.65 s, so demos use Retell.",
      },
      {
        title: "Hard limits on cost and reach.",
        body: "Every call and Lab run has a spend cap. Outbound calls go only to allowlisted, consenting numbers, a refused number is never stored, and the public callback form is rate limited.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["Next.js", "React", "TypeScript"] },
      { group: "Backend", items: ["Python 3.12", "FastAPI", "Pydantic"] },
      { group: "Data", items: ["Supabase Postgres", "pgvector", "Row Level Security"] },
      { group: "AI", items: ["OpenRouter (DeepSeek v4.1 Flash)", "OpenAI embeddings", "RAG with quote verification", "LLM-as-judge"] },
      { group: "Voice", items: ["Retell", "LiveKit Agents", "Telnyx SIP", "faster-whisper", "Kokoro TTS"] },
      { group: "Tooling", items: ["Playwright", "Prometheus", "pytest", "ruff", "mypy", "CI"] },
    ],
    gallery: [
      { image: img("counselai", "02-config-review"), alt: "Configuration review screen showing extracted firm details with source quotes.", caption: "Review: every drafted field shows the quote it came from." },
      { image: img("counselai", "03-call-detail"), alt: "Call detail page with audio waveform, synced transcript, key facts, performance grade and tool calls.", caption: "Call detail: recording, transcript, facts, grade and tool calls." },
      { image: img("counselai", "04-lab-matrix"), alt: "Lab results matrix of synthetic callers against agent versions.", caption: "Lab: synthetic callers and pass rates by run." },
      { image: img("counselai", "01-builder-progress"), alt: "Builder progress view while a firm's website is crawled.", caption: "Builder: crawling a firm's website into a draft agent." },
      { image: img("counselai", "06-metrics"), alt: "Metrics dashboard with calls per day, reply wait and cost per call.", caption: "Metrics: calls, reply wait, cost per call and Lab pass rate." },
      { image: img("counselai", "05-demo-firm-home"), alt: "Fictional demo law firm website with a request-a-callback form.", caption: "A fictional firm site with the callback form that rings the agent." },
    ],
    galleryNote:
      "Dashboard images are design-reference renders of the target UI, not live captures. The firms, callers and numbers in this project are all fictional.",
    limits: {
      title: "Limits, and what I'd build next",
      items: [
        "The firms, callers and calendar are mocked, and nothing here is production-ready: no multi-tenant access control, no real calendar, no recording-consent handling by state.",
        "The judge was calibrated by one scorer on a small set. Run-to-run noise is real: re-running the planted tests moved the catch rate between 7/7 and 5/7.",
        "Next: a structured rules editor (websites rarely state a firm's real screening criteria), then the handoff after the call, such as warm transfer, confirmation texts and case-system sync.",
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "proxidex",
    name: "Proxidex",
    tagline:
      "A print studio that turns a deck list into a perfectly cuttable proxy-card PDF in seconds.",
    summary:
      "A full-stack web app for Pokémon TCG players: search 20,000+ cards, import a tournament deck in one click, and export print-ready sheets with smart bleed and cut lines.",
    category: "Full-stack SaaS",
    year: "2026",
    role: ROLE,
    status: "Live",
    links: {
      live: { url: "https://proxidex.com", label: "proxidex.com" },
      repo: { url: "https://github.com/louisiaegerv/proxidex", isPrivate: true },
    },
    hero: img("proxidex", "hero"),
    heroAlt:
      "A laptop showing the Proxidex Print Studio, surrounded by printed card sheets, a printer and a paper cutter.",
    accent: "#6366f1",
    metrics: [
      { value: "20,000+", label: "cards searchable, with every printing" },
      { value: "<100 ms", label: "full-text card search (SQLite FTS5)" },
      { value: "99.6%", label: "fewer database reads from cursor pagination" },
      { value: "450 dpi", label: "print-file export" },
    ],
    star: {
      situation:
        "Players who want to test a tournament deck before buying it can print proxies at home, but the process is time consuming and annoying. Cards have to be searched for by their unique IDs, deck lists arrive in inconsistent text formats, card images have transparent rounded corners, and without a printed bleed area a slightly crooked cut leaves white edges or slices into the card.",
      task:
        "Build a web app that takes anyone from \"I want to print a deck list/custom group of cards\" to \"I have a print file I can cut cleanly\" with no design skills, fast enough on a 20,000-card catalogue to feel instant, and cheap enough to run that a free tier is sustainable.",
      action: [
        "Built card search on a Turso (SQLite) database with FTS5, then added a content-hashed client-side card index so the most common action, a plain name search, costs zero database reads.",
        "Wrote a forgiving deck-list parser with several fallback strategies, one-click import of the top tournament decks from Limitless TCG, and import by URL. Unresolvable cards are surfaced for the user to fix rather than silently dropped.",
        "Moved heavy image work server-side with Sharp: a corner-stretching algorithm removes transparent corners, and three bleed methods (replicate, mirror, edge stretch) extend card edges, including full-art borders and gradients, not just solid colors.",
        "Built a live print preview with drag-and-drop reordering, zoom, multi-page layout and cut-line overlays, plus saved print profiles for every setting.",
        "Added accounts with Clerk and Stripe billing, with medium-quality export free and high quality on Pro, and stored images on Cloudflare R2 for fast global delivery.",
      ],
      result: [
        "Live at proxidex.com with 200+ active users, a landing page, the app, accounts and paid billing.",
        "Search returns in under 100 ms across the full catalogue, and cursor pagination cut database reads by 99.6%.",
        "The bleed handling means a printed sheet can be cut by hand without clipping card edges, which is the problem that sent players to professional print shops.",
      ],
    },
    flow: {
      title: "How it works",
      steps: [
        { title: "Find cards", body: "Search by name, filter by set, or browse a set's catalogue. Every printing of every card is selectable." },
        { title: "Import a deck", body: "Paste a list, pick a top tournament deck, or paste a Limitless URL. Cards resolve automatically." },
        { title: "Arrange", body: "Drag cards into order, click any card to switch its printing, and preview exactly what will print." },
        { title: "Configure", body: "Page size, grid, gap, bleed method and amount, cut lines and offsets, saved as reusable profiles." },
        { title: "Export", body: "Download a high-resolution print file with bleed and cut guides baked in." },
      ],
    },
    decisions: [
      {
        title: "Make the common action free.",
        body: "A content-hashed JSON snapshot of the card index is cached in the browser, so plain-text searches never touch the database. That keeps hosting cost flat as usage grows.",
      },
      {
        title: "Treat bleed as an image-processing problem.",
        body: "Extending edge color works for solid borders but looks wrong on gradients and full-art cards, so there are three methods and automatic border detection, chosen per print job.",
      },
      {
        title: "Server-side image processing.",
        body: "Corner removal and bleed generation run in API routes with caching, so the browser stays responsive while previewing hundreds of cards.",
      },
      {
        title: "One database, two environments.",
        body: "Turso in production and a local SQLite file in development share one schema, so development is fast and offline-friendly.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Zustand", "dnd-kit", "Framer Motion"] },
      { group: "Data", items: ["Turso (libSQL)", "SQLite FTS5", "Cloudflare R2"] },
      { group: "Imaging and print", items: ["Sharp", "jsPDF", "pdf-lib"] },
      { group: "Platform", items: ["Clerk (auth)", "Stripe (billing)", "Vercel"] },
    ],
    gallery: [
      { image: img("proxidex", "print-studio"), alt: "Print Studio with layout, spacing, bleed and cut-line controls beside a live sheet preview.", caption: "Print Studio: layout, bleed and cut-line controls beside a live sheet preview." },
      { image: img("proxidex", "meta-decks"), alt: "Meta Decks browser showing the top tournament decks with play counts and share.", caption: "Meta Decks: one-click import of top tournament decks." },
      { image: img("proxidex", "decks"), alt: "My Decks page with deck boxes themed by energy type and a deck detail panel.", caption: "My Decks: saved lists with a deck breakdown panel." },
      { image: img("proxidex", "card-search"), alt: "Card Explorer showing 61 sets with search and energy filters.", caption: "Card Explorer: browse by set, search by name, filter by type." },
    ],
    limits: {
      title: "Limits, and what I'd build next",
      items: [
        "Proxidex is an unofficial fan tool for playtesting and casual play.",
        "Roadmap items include cross-device sync for custom card art, a collection tracker, and AI-written, context-aware UI messages from a small, cheap model.",
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "rifft",
    name: "rifft",
    tagline:
      "A swipe file for ad creatives, with a one-click Chrome clipper and AI that riffs on winning ads.",
    summary:
      "Save any ad from the Meta Ad Library in one click, record why it works, search the whole collection, then generate new takes on a proven ad using your own brand's logo and colors.",
    category: "Full-stack SaaS · Generative AI",
    year: "2026",
    role: ROLE,
    status: "Pre-launch",
    links: {
      repo: { url: "https://github.com/louisiaegerv/rifft", isPrivate: true },
    },
    heroAlt: "rifft, an ad creative library with a Chrome clipper and AI ad generation.",
    accent: "#f97316",
    metrics: [
      { value: "~$0.019", label: "measured cost per AI-generated ad" },
      { value: "1 click", label: "to save an ad from the Meta Ad Library" },
      { value: "25 ads", label: "riffed in a single bulk run" },
      { value: "Multi-tenant", label: "accounts, plans, credits and rate limits" },
    ],
    star: {
      situation:
        "Media buyers and agencies study competitors' ads constantly, but the research lives in screenshot folders and chat threads. Nobody can find last month's best ad, remember how long it ran, or recall why it worked, and turning a good idea into a new creative is a separate, manual job.",
      task:
        "Build a library where saving an ad takes a single click and the collection feeds creative production, then shape it into a business: a generous free tier, paid AI generation priced from measured costs, and protection against abuse.",
      action: [
        "Built a Chrome extension that adds a Save button to every Meta Ad Library card and captures advertiser, start date, ad link, creative, copy, headline, button text and landing page. It reads fields by their position relative to stable words like \"Sponsored\" because Meta's class names are hashed and change.",
        "Made connecting zero-setup: a bridge script on rifft's own pages hands the extension a scoped token for the signed-in account, which is accepted only by the three endpoints it needs.",
        "Sent uploads straight from the browser to Cloudflare R2 through presigned URLs, with a vision model (via OpenRouter) that can auto-fill title, copy, niche, why-it-works and tags from a screenshot.",
        "Built \"riff on this\": pick an ad, apply a saved brand's logo and colors, and generate new takes, singly or in bulk (up to 25 ads, three at a time, with stop and retry). Copy is passed as context but never printed into the image.",
        "Measured the real cost of a generation before pricing anything, then tuned the input down (reference images at 512 px were as good as larger and cheaper).",
        "Made it multi-tenant with a dry-run migration that backs up the database first, plus rate limits, plan caps, a credit ledger with refunds on failed generations, a daily storage cleanup job, soft deletes, account export and deletion, and Stripe billing.",
      ],
      result: [
        "Phase 1 is code-complete: library, collections, bulk actions, clipper extension, AI generation, billing and account tools. The remaining steps before opening signups are setup tasks, not features.",
        "A generation costs about $0.019 at low quality, measured from real token usage. That sets credit packs at an estimated 59 to 66% margin after Stripe's fee.",
        "A free tier sized for roughly 500 to 1,000 ads, with a capped, once-only five-credit trial and a daily ceiling on trials across everyone to limit fake-account abuse.",
      ],
    },
    flow: {
      title: "How it works",
      steps: [
        { title: "Clip", body: "Press Save to rifft on any Meta Ad Library card. The ad, copy and landing page are saved straight away." },
        { title: "Organize", body: "Collections, tags, niche and platform filters, search, and notes on why each ad works." },
        { title: "Riff", body: "Choose an ad and a brand. The model generates fresh takes that keep the proven idea and use your identity." },
        { title: "Scale", body: "Bulk-riff up to 25 ads at once into a collection, with progress, stop and retry." },
      ],
    },
    decisions: [
      {
        title: "Price from measured cost, not guesses.",
        body: "Before any billing code, I ran a generation with a real ad and logo as inputs and recorded the tokens. Credits, packs and the agency tier all derive from that number.",
      },
      {
        title: "Protect the unit economics.",
        body: "Credit packs are subscriber-only (they cost less per credit than a plan), failed generations are refunded, and there is a per-user daily limit and a global trial ceiling.",
      },
      {
        title: "Resilient scraping.",
        body: "The extension anchors on visible text, runs its button in a shadow root so the host page's CSS can't touch it, and keeps the extraction logic in one file so a markup change is a one-file fix.",
      },
      {
        title: "Safe migrations.",
        body: "Moving a single-user database to multi-tenant ran as a dry run inside a transaction, wrote a backup before applying, and was verified against the real data.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["Next.js 16 (App Router)", "React 19", "TypeScript", "Tailwind CSS 4", "shadcn/ui", "Framer Motion"] },
      { group: "Data", items: ["Turso (libSQL)", "Drizzle ORM", "Cloudflare R2"] },
      { group: "AI", items: ["OpenAI image model", "OpenRouter vision model (DeepSeek)"] },
      { group: "Platform", items: ["Clerk (auth)", "Stripe billing and tax", "Vercel + cron"] },
      { group: "Extension", items: ["Chrome extension", "Shadow DOM", "Token bridge"] },
    ],
    gallery: [],
    galleryNote: "Screenshots are on the way.",
    limits: {
      title: "Status, and what's next",
      items: [
        "Not yet open to the public: the last steps are database migration, legal pages reviewed by a lawyer, and sign-up protection.",
        "Planned: share links, a waitlist to validate demand before scaling, and bulk and agency-tier features.",
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "imagine",
    name: "Imagine",
    tagline:
      "A local AI image studio with a searchable library and per-image cost tracking. No subscription.",
    summary:
      "Generate images with OpenAI's image model, keep every one in a browsable library on your own machine, and see exactly what each cost. It also plugs into Claude Desktop, so Claude can generate images in chat.",
    category: "AI tooling · Local-first app",
    year: "2026",
    role: ROLE,
    status: "Open source",
    links: {
      repo: { url: "https://github.com/louisiaegerv/imagine", isPrivate: false },
    },
    hero: img("imagine", "hero"),
    heroAlt:
      "Imagine, a local AI image studio, shown on a laptop in front of an aurora sky.",
    accent: "#38bdf8",
    metrics: [
      { value: "~$0.004", label: "per image from a text prompt" },
      { value: "~100", label: "reference-image edits per $1" },
      { value: "$0", label: "in subscriptions, accounts or servers" },
      { value: "MCP", label: "built in, so Claude can generate images" },
    ],
    star: {
      situation:
        "Generating images through a chat app or subscription site has annoyances that add up. You pay monthly whether you use it or not, the API hands an image back once and keeps no library, spend is invisible, and reference images are billed by pixel count, so a 12-megapixel phone photo costs far more than it should for no better result.",
      task:
        "Build a personal image studio where cost is per image, every image and its settings are kept, spend is always visible, and nothing is locked into a service.",
      action: [
        "Wrapped OpenAI's image API in a local Next.js app: prompt plus up to three reference images, nine aspect ratios, and several generations running at once.",
        "Added automatic reference-image preparation: images are shrunk to 512 px (EXIF-aware, WebP, never upscaled) before being sent, while the original stays untouched in the library. This is where most of the savings come from.",
        "Stored every prompt, setting, token count and cost in a local SQLite database, with cost computed from the token usage the API returns rather than estimated.",
        "Built the library: card and list views with infinite scroll, a details panel, one-click reuse of an image's prompt, collections, and bulk select for adding, removing or deleting dozens at once.",
        "Added theming (background images with blur and overlay controls), a phone layout with a thumb-reach tab bar, and a small MCP server so Claude Desktop can generate and show images in chat.",
      ],
      result: [
        "A text-only image costs roughly $0.003 to $0.005, and about $0.0097 with a reference image. A hundred images costs about a dollar, and a month of not using it costs nothing.",
        "Every image shows its own cost and token breakdown, with a running total in the library.",
        "It's the tool I now use to generate project hero images from app screenshots, including some on this page.",
      ],
    },
    flow: {
      title: "How it works",
      steps: [
        { title: "Prompt", body: "Write a prompt, optionally attach up to three reference images, and pick shape and quantity." },
        { title: "Prepare", body: "References are downscaled before upload to avoid paying for pixels that don't help." },
        { title: "Generate", body: "Text-only requests use the generations endpoint; requests with references use edits." },
        { title: "Keep", body: "The image, prompt, settings, token usage and cost are saved locally." },
        { title: "Reuse", body: "Group into collections, reuse any prompt in one click, or ask Claude to generate through MCP." },
      ],
    },
    decisions: [
      {
        title: "Local-first.",
        body: "SQLite via Node's built-in module, files on disk, and no hosted backend. You can stop using it any time without losing anything.",
      },
      {
        title: "Optimize the bill, not just the UI.",
        body: "Understanding how the API prices input images led directly to the biggest feature: downscaling references automatically and keeping the original.",
      },
      {
        title: "Cost is data, not an estimate.",
        body: "Each image's cost is computed from the real token usage returned with it, so the running total can be trusted.",
      },
      {
        title: "Meet the model where it works.",
        body: "An MCP server turns the app into a tool Claude can call, with generated images and their cost appearing directly in the conversation.",
      },
    ],
    stack: [
      { group: "App", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "shadcn/ui (Radix)", "Motion"] },
      { group: "Data", items: ["SQLite (node:sqlite)", "Local file storage", "Zod validation"] },
      { group: "Imaging", items: ["OpenAI Images API", "Sharp"] },
      { group: "Integration", items: ["Model Context Protocol SDK"] },
    ],
    gallery: [
      { image: img("imagine", "library-image-details"), alt: "The library grid with the details panel open, showing an image's collection, prompt and settings.", caption: "The library, with the details panel open on an image." },
      { image: img("imagine", "generation-page"), alt: "The Generate page with prompt, reference images, aspect ratio slider and quantity.", caption: "Generate: prompt, up to 3 reference images, aspect ratio, quantity." },
      { image: img("imagine", "Collection-page"), alt: "The Collections page with a cover mosaic for each collection.", caption: "Collections, with cover mosaics." },
      { image: img("imagine", "image-details-cost"), alt: "An image's usage and cost: input text, input image and output image tokens with their cost.", caption: "Token usage and cost, per image." },
      { image: img("imagine", "bg-after"), alt: "The library with an aurora background behind the sidebar and main area.", caption: "Theming: a preset background on the sidebar and main area." },
      { image: img("imagine", "mcp-example"), alt: "Claude Desktop generating a website mockup through the Imagine MCP server and reporting its cost.", caption: "From Claude Desktop, through the MCP server." },
      { image: img("imagine", "mobile-view"), alt: "The mobile tab bar with Library, Generate and Collections.", caption: "Phone layout with a thumb-reach tab bar." },
      { image: img("imagine", "light-mode"), alt: "The library in light mode with a soft pastel background.", caption: "Light mode: the overlay follows the theme." },
    ],
    limits: {
      title: "Limits",
      items: [
        "A single-user local app by design: there is no login and no hosted version.",
        "Output is always webp. Quality defaults to low to keep renders cheap, and medium is a setting away.",
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "leadfinder",
    name: "LeadFinder",
    tagline:
      "A prospecting engine that finds the businesses worth calling and tells you what to pitch each one.",
    summary:
      "Scrape Google Maps for a market, score every business for fit against each offer you sell, enrich it with owner and contact details, and work the list from a call queue, with cost shown before anything is spent.",
    category: "Data pipeline · Sales automation",
    year: "2026",
    role: ROLE,
    status: "Open source",
    links: {
      repo: { url: "https://github.com/louisiaegerv/leadfinder", isPrivate: false },
    },
    hero: img("leadfinder", "hero"),
    heroAlt:
      "Leadfinder: glowing pins on a night-time city map beside a ranked Top Prospects list with scores.",
    accent: "#22c55e",
    metrics: [
      { value: "5", label: "offers scored per business, each with visible evidence" },
      { value: "$0", label: "for the automatic website quick-scan" },
      { value: "~$0.002", label: "to refresh a place's newest reviews" },
      { value: "1 cap", label: "hard spend limit sent with every scrape" },
    ],
    star: {
      situation:
        "A marketing agency selling to flooring and concrete, painting, fencing and moving companies was prospecting by hand: scrolling maps, guessing who could afford a retainer, and guessing which offer to open with. Paid lead lists charge per record and are full of noise, and scraping tools can quietly run up a bill.",
      task:
        "Build a prospecting tool that finds every relevant business in a market, ranks them by real fit for each service on offer, explains the ranking, fills in how to reach the owner, and tracks outreach, all with the cost known before it's spent.",
      action: [
        "Modeled each vertical as a niche playbook (target categories, excluded chains, offer weights). Service areas are drawn on a map as a radius or polygon, and the app lays out the search grid and shows search points, run time and cost before anything runs.",
        "Ran Google Maps scrapes on Apify under a hard per-run spend cap, then normalized and deduplicated everything into one local database. Places are shared across niches, so a business is never scraped or paid for twice.",
        "Designed a transparent scoring model: a fit gate multiplied by capacity (max 40), visible gaps (max 35) and reachability (max 25), with each business compared against local peers by ZIP and category. Every score lists its evidence, and inferred evidence is labeled as inferred.",
        "Built tiered enrichment, from a free HTTP site scan (social links, emails, phones, missing mobile site, no contact form) to a cheap web search for the owner and a paid website reader. Owner names are accepted only when a source states them, and a typed name is never overwritten.",
        "Used an LLM only for the gray zone that rules can't decide, showing what is sent and to which model first, and never overwriting a hand-set label.",
        "Added an outreach tracker with a call queue, a pitch brief per business (opener, evidence, objection answers), follow-ups, daily goals, backup and CSV export, and a phone layout.",
      ],
      result: [
        "Replaced manual list-building with a ranked, explained prospect list per niche and per offer.",
        "Every dollar is visible up front: likely cost, worst case and the hard cap are shown before a run, and paid enrichment is off unless ticked.",
        "Every score can be argued with, because each shows the evidence behind it. That makes the pitch brief credible on a cold call.",
      ],
    },
    flow: {
      title: "How it works",
      steps: [
        { title: "Define a niche", body: "Start from a preset or from scratch, with target categories, exclusions and offer weights." },
        { title: "Draw an area", body: "Mark a radius or polygon and review the search grid, run time and cost." },
        { title: "Launch a run", body: "Confirm the estimate. A capped scrape runs, then results are normalized and deduplicated." },
        { title: "Score and enrich", body: "Every business is scored per offer, and a free scan fills in contacts and website signals." },
        { title: "Work the list", body: "A call queue serves due follow-ups first, then the best untouched leads, with a pitch brief for each." },
      ],
    },
    decisions: [
      {
        title: "Show the cost before spending it.",
        body: "Estimates, worst cases and hard caps appear before every paid action. Cheap and free steps run automatically; paid ones are opt-in.",
      },
      {
        title: "Rules first, LLM for the gray zone only.",
        body: "Deterministic rules sort most businesses. The model reviews only the undecided ones, in a batch, and a human decision always wins.",
      },
      {
        title: "Evidence over opinion.",
        body: "Each offer score lists what it was based on. Facts about the specific business outweigh trade-level assumptions, so the same offer doesn't lead for everyone.",
      },
      {
        title: "Run local, own the data.",
        body: "A single SQLite file with one-click backup and CSV export. There is no hosted backend to run or secure.",
      },
    ],
    stack: [
      { group: "App", items: ["Next.js 16", "React 19", "TypeScript", "Leaflet maps", "Zod"] },
      { group: "Data", items: ["SQLite (better-sqlite3)", "Drizzle ORM"] },
      { group: "Data sources and AI", items: ["Apify (Google Maps scraping)", "OpenRouter (LLM review and web search reading)"] },
      { group: "Quality", items: ["Vitest"] },
    ],
    gallery: [
      { image: img("leadfinder", "prospect-table"), alt: "Prospects table sorted by score with tier, lead offer, runner-up, area, stage, rating and contact.", caption: "Prospects ranked by score, with lead offer and runner-up." },
      { image: img("leadfinder", "newarea"), alt: "New area page with a polygon drawn over Austin on a map.", caption: "Draw an area. The grid of search points is laid out for you." },
      { image: img("leadfinder", "newarea-run-launch-review"), alt: "Launch dialog with likely cost, worst case and the hard cap sent to Apify.", caption: "Likely cost, worst case and hard cap before a run launches." },
      { image: img("leadfinder", "prospect-detail-score"), alt: "Score and offers tab with capacity, gaps and reachability bars and evidence for each offer.", caption: "Why it scored that way, with the evidence." },
      { image: img("leadfinder", "prospect-map"), alt: "Map of prospects coloured by tier with search areas outlined.", caption: "The same list on a map, colored by tier." },
      { image: img("leadfinder", "prospect-detail-outreach2"), alt: "Business page with a call log beside a pitch brief with opener, evidence and objection answers.", caption: "Outreach tab: call log and a ready pitch brief." },
      { image: img("leadfinder", "outreach"), alt: "Outreach page with a Ready to call card, daily goal, follow-ups and objections.", caption: "Outreach: ready to call, today's goal, follow-ups and objections." },
      { image: img("leadfinder", "prospect-ai-review"), alt: "Dialog asking to classify undecided businesses with a model, stating what is sent.", caption: "LLM review of the gray zone says what it sends and where." },
      { image: img("leadfinder", "prospect-detail-extradetails"), alt: "Details tab with owner, contact, website signals, socials and the Facebook page.", caption: "What enrichment fills in: owner, emails, phones and socials." },
      { image: img("leadfinder", "mobile-call-queue"), alt: "The call queue on a phone, above a bottom tab bar.", caption: "On a phone, the queue bar sits above the tab bar." },
    ],
    limits: {
      title: "Limits, and what's not built yet",
      items: [
        "Runs on your own machine with your own API keys and has no login, so it isn't meant to be exposed to the internet.",
        "Not built yet: a Meta Ad Library check for whether a business runs ads, a coverage panel with AI keyword discovery, and a territory guard for signed clients.",
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "stt",
    name: "Local STT",
    tagline:
      "Self-hosted speech-to-text for call recordings: private, fast, and wired for automation.",
    summary:
      "Upload a recording and it is transcribed on my own GPU with Whisper, stored, searchable, correctable, and announced to other systems with signed webhooks. Nothing leaves the machine.",
    category: "AI infrastructure · Speech",
    year: "2026",
    role: ROLE,
    status: "Open source",
    links: {
      repo: { url: "https://github.com/louisiaegerv/stt", isPrivate: false },
    },
    hero: img("stt", "hero"),
    heroAlt:
      "A laptop showing the call transcripts web app, with audio waveforms flowing into lines of text.",
    accent: "#3b82f6",
    metrics: [
      { value: "~13 s", label: "to transcribe a 2-minute call on a GTX 1660 SUPER" },
      { value: "$0", label: "per minute, since it runs on my own hardware" },
      { value: "100%", label: "local: recordings never leave the machine" },
      { value: "3", label: "retries, with a delivery log, on every signed webhook" },
    ],
    star: {
      situation:
        "Call recordings from lead-generation phone lines hold the most honest data a business has: what callers asked for, what they objected to, who they were looking for. Almost nobody listens to them. Cloud transcription charges by the minute and sends customer audio to a third party.",
      task:
        "Build a small service that any CRM, dialer or automation can send a recording to and be notified when the transcript is ready. It should run on a modest consumer GPU, let a person fix mistakes safely, and never need an external API.",
      action: [
        "Wrapped faster-whisper (large-v3-turbo) in a FastAPI service with a REST API, interactive docs, and uploads that return immediately with a 202.",
        "Used a single background worker with one loaded model and a persistent queue. The GPU is the bottleneck, one job at a time keeps memory predictable on a 6 GB card, and anything unfinished at shutdown resumes on the next start.",
        "Tuned for a small GPU with int8_float16 compute, ffmpeg decoding to 16 kHz mono, and voice activity detection that skips hold music and silence, which cuts hallucinated text.",
        "Added HMAC-SHA256 signed webhooks with backoff retries and a per-recording delivery log, plus an optional per-upload callback URL, so downstream automations can trust and trace every event.",
        "Built a no-build web page for search across filenames and transcripts, click-a-line-to-seek playback, and line-by-line correction that saves Whisper's original output first so any edit can be reverted.",
      ],
      result: [
        "A 2-minute call transcribes in about 13 seconds on a GTX 1660 SUPER, with no per-minute cost.",
        "A clean integration surface: upload, poll or receive a signed webhook, and fetch a paste-ready transcript to feed straight into an AI step.",
        "Corrections are non-destructive, so cleaned-up transcripts are safe to build analysis on.",
      ],
    },
    flow: {
      title: "How it works",
      steps: [
        { title: "Upload", body: "Drag a file into the page or POST it to the API. It returns at once with a recording ID." },
        { title: "Queue", body: "The file is saved and a queued row is written. One worker takes jobs in order." },
        { title: "Transcribe", body: "ffmpeg decodes the audio, voice activity detection trims silence, and Whisper produces timestamped segments." },
        { title: "Notify", body: "Signed webhooks fire to every registered target, with retries and a delivery log." },
        { title: "Review", body: "Search, play, correct and export, with the original always recoverable." },
      ],
    },
    decisions: [
      {
        title: "One worker, one model, one job at a time.",
        body: "The GPU is the bottleneck. A single loaded model keeps VRAM use predictable, and uploads never wait on transcription.",
      },
      {
        title: "Non-destructive edits.",
        body: "The first correction copies the original segments aside. Revert restores them, so humans can improve the text without destroying the source of truth.",
      },
      {
        title: "Webhooks that can be trusted and debugged.",
        body: "Bodies are HMAC-signed, delivery runs in separate threads so a slow receiver never blocks the worker, and every attempt is logged.",
      },
      {
        title: "No fragile dependencies.",
        body: "CUDA libraries come from pip, audio decoding uses the system ffmpeg instead of a version-sensitive wrapper, and the UI is a single page with no build step.",
      },
    ],
    stack: [
      { group: "Service", items: ["Python", "FastAPI", "uvicorn", "httpx"] },
      { group: "AI", items: ["faster-whisper (CTranslate2)", "Whisper large-v3-turbo", "CUDA 12", "Voice activity detection"] },
      { group: "Data", items: ["SQLite (WAL mode)"] },
      { group: "Audio and UI", items: ["ffmpeg", "Plain HTML, CSS and JS"] },
    ],
    gallery: [
      { image: img("stt", "ui"), alt: "Web UI showing a transcribed call with an audio player and one line being corrected.", caption: "Recordings on the left; audio, actions and timestamped lines on the right. One line is open for correction, and corrected lines carry a dot." },
    ],
    limits: {
      title: "Limits",
      items: [
        "Needs an NVIDIA GPU for the speed above. CPU works, much slower.",
        "Built to run on localhost. Set an API key before exposing it beyond your machine.",
      ],
    },
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
