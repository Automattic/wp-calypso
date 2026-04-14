Spent some time exploring what the Reader experience could look like if we brought it closer to where people already are — the browser's new tab page. Sharing a quick recap so folks can take a look and poke at it.

## Reader New Tab extension

Prototyped a Chrome extension that replaces the default new tab page with your WordPress.com Reader feed. Instead of Chrome's default page, you see the latest posts from your subscriptions every time you open a new tab.

The idea: Reader has a great feed, likes, comments, and content discovery — but it lives inside wordpress.com. What if that space was already showing them the content they care about?

**The hypothesis:** if we put Reader content where people already are — the new tab page — they'll come back to the platform more often, engage more with the content they follow, and build a reading habit without us having to compete for their attention. The new tab is a space with zero friction: no URL to type, no app to open, no notification to act on. It's just there.

### A lighter, faster Reader

This isn't a port of the existing Reader. The full Calypso Reader carries a lot of weight, and that's fine for wordpress.com — but a new tab page needs to feel instant. So we built this from scratch with speed as the top priority: a much smaller codebase, direct API calls, plain CSS. The result is a Reader experience that loads significantly faster, with a fraction of the overhead.

### Why this is interesting

The new tab page is one of the highest-traffic surfaces in any browser. Putting the Reader there turns every tab into a gentle reminder to check in — users don't have to remember to visit the Reader, the content is just there. Over time that builds a reading habit around the platform. Subscribed content stays visible, which makes subscribing feel more valuable and drives engagement passively. And it's a tiny surface to build and maintain, but users who install it are making a deliberate choice to keep WordPress.com in their daily workflow — a strong retention signal.

### What's working

- **Personalized feed** — shows posts from your subscriptions
- **Authentication** — log in with your WordPress.com account, stays logged in
- **Search bar** — respects whatever search engine you use (Google, DuckDuckGo, etc.)
- **Two layouts** — grid (masonry style) or list view, preference remembered
- **Infinite scroll** — loads more posts as you scroll
- **Direct Reader links** — each card opens the post in the full Reader, not the original blog
- **Uncropped images** — full images with a blurred background fill, so nothing gets cropped
- **Smart placeholders** — posts without images get an auto-generated placeholder instead of being blank
- **Header** — WordPress.com wordmark, Reader/Help/Notifications icons, and your real avatar

### Design decisions

**Images with varying aspect ratios** — every blog has different image sizes. Instead of cropping, we show the full image and fill the remaining space with the image itself, blurred. Visually clean without losing content.

**Posts without images** — we generate a screenshot of the post URL and apply a blur + darken effect to turn it into an atmospheric placeholder. Looks intentional rather than broken.


### What's left

**Before shipping, we need:**

- A layout and design review — the current layout is functional but hasn't been through design yet. Needs a pass on spacing, typography, card styles, and overall polish to feel like a real WordPress.com surface.
- Define the minimum feature set for an MVP. Right now the prototype has a lot of things working, but not everything needs to ship in v1. A few open questions:
  - Is the search bar essential or can it wait?
  - Do we need both grid and list layouts, or ship with one?
  - What's the minimum viable logged-out experience?
  - Should the header match the Reader exactly, or can it be simpler?
- Publish to the Chrome Web Store and hook up the real listing URL in the banner
- Re-enable browser detection and dismiss persistence on the banner (both disabled for testing)
- Figure out the experience for logged-out users or users with no subscriptions

### How users will discover it

The extension will be on the Chrome Web Store. Beyond organic discovery there, the main active channel is a **promotional banner inside the Reader** itself.

When someone visits the Reader on a Chromium-based browser (Chrome, Edge, Brave), they see a banner at the top of their feed. Current copy:

> **Never miss a post**
> Install our Chrome extension to make the Reader your new tab page — your favorite blogs, right where you start.
> **[Add to Chrome]**

The banner links to the Chrome Web Store listing and can be permanently dismissed. Users on Firefox or Safari won't see it since the extension only works on Chromium browsers.

### How to try it

The extension isn't on the Chrome Web Store yet. To test locally:

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked** and select the `reader-new-tab-api/dist` directory
4. Open a new tab

### Future possibilities

If the MVP lands well, there are a few natural next steps:

- **Saved posts** — surface the user's read-it-later list right on the new tab, so saved posts stay top of mind instead of buried in a menu
- **Inline reading** — let users read full posts without leaving the new tab page, reducing friction and keeping them in the flow

### Feedback welcome, especially on

- Whether the banner copy and placement feel right
- The new tab layout — grid vs. list as default
- The logged-out / no-subscriptions experience
- Anything design-related
