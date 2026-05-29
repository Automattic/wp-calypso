/**
 * Tailored task registry for the AI Launchpad.
 *
 * Entries are filtered by wizard answers (Goals × Features) and current site
 * state, then ordered by category. Each entry's comment cites the data point
 * that justifies its inclusion — see `wizard/docs/claude_insight-index-launchpad-research.md`.
 */
import type { FeatureKey, GoalKey } from './types';

export type TaskCategory = 'activation' | 'feature-setup' | 'discover' | 'growth';

export type ActivationSignal =
	| 'first_published_post'
	| 'first_product'
	| 'first_subscriber'
	| 'custom_domain_connected'
	| 'site_launched';

export type SiteState = {
	siteSlug: string;
	postCount: number;
	pageCount: number;
	subscriberCount: number;
	hasCustomDomain: boolean;
	isLaunched: boolean;
	hasProduct: boolean;
	installedPluginSlugs: string[];
};

export type TaskTemplate = {
	id: string;
	title: string;
	subtitle?: string;
	category: TaskCategory;

	/** Any-of match: include if user's goal is in this list. */
	goals?: GoalKey[];
	/** Any-of match: include if at least one selected feature is in this list. */
	features?: FeatureKey[];

	/** Hide the task once these site-state conditions are true. */
	hideWhen?: Partial< {
		hasPosts: boolean;
		hasPages: boolean;
		hasSubscribers: boolean;
		hasCustomDomain: boolean;
		isLaunched: boolean;
		hasProduct: boolean;
		pluginInstalled: string;
	} >;

	/**
	 * In-Calypso destination for the task, built from the site `:slug`.
	 *
	 * The return type is a root-relative path (`/${string}`) on purpose: it's a
	 * COMPILE-TIME guarantee that every task stays inside Calypso. An absolute
	 * URL (`https://…`, the live site, `/wp-admin/…` on another host) is not
	 * assignable to `/${string}`, so TypeScript rejects it here — a task can
	 * never be wired to open the live site or leave the app. Keep it relative.
	 */
	url: ( slug: string ) => `/${ string }`;
	cta: string;

	/**
	 * Marks this as a "pattern" task: instead of navigating to `url`, the CTA
	 * builds a real wpcom *page* and opens it in the editor. `url` stays as the
	 * fallback if the page can't be created. See `draft-pattern-page.ts`.
	 *
	 * With `category`: page is seeded from a WordPress.com block pattern (PTK)
	 * with its copy rewritten by Dolly. Used for events / about / contact etc.
	 * Without `category`: page is seeded with just a Dolly-generated heading +
	 * lead paragraph (requires `intro: true`); the body stays empty so the user
	 * picks their own layout in the editor. Used for the gallery task.
	 */
	pattern?: {
		/** PTK category slug to source the pattern from (e.g. `events`). Omit for
		 * an intro-only page with no pattern (user picks layout in the editor). */
		category?: string;
		/** Title for the created page. */
		pageTitle: string;
		/** Prepend a Dolly heading + lead paragraph. Required when `category` is
		 * omitted (otherwise the page would be empty). */
		intro?: boolean;
		/** Swap the pattern's stock images for niche-matched Openverse photos.
		 * Only meaningful with `category`. */
		images?: boolean;
	};

	/**
	 * Marks this as a "page-creating" task. The CTA opens the wp-admin page
	 * editor directly (bypassing Calypso's `/page/:slug` route, which drops
	 * `#hash` fragments) with the `#launchpad-next-steps` hash so the
	 * post-publish snackbar fires with a "Next steps" action back to /home.
	 * Implied by `pattern` — set explicitly only for non-pattern page tasks
	 * that point at `/page/...` (e.g. About, Contact, Forms, Video).
	 * See `launchpad-editor-url.ts` and the wpcom-block-editor feature
	 * `onboarding-next-step-after-publishing-post.jsx`.
	 */
	createsPage?: boolean;

	/** Used to detect "done" without round-tripping the server. */
	completesOn?: ActivationSignal;
};

const GOALS_ALL: GoalKey[] = [ 'write', 'build', 'sell', 'newsletter', 'educate', 'portfolio' ];

export const TASK_REGISTRY: TaskTemplate[] = [
	// ─── Activation core (the spine; closes the loop on the pitch's
	// "meaningful first action" metric — see Insight Index §3:
	// "27% complete setup but only 10% publish, 17pp gap to close".)
	{
		id: 'publish-first-post',
		title: 'Publish your first post',
		subtitle: 'Share something. Real publish, not a draft.',
		category: 'activation',
		goals: [ 'write', 'newsletter', 'educate' ],
		hideWhen: { hasPosts: true },
		url: ( s ) => `/post/${ s }`,
		cta: 'Write post',
		completesOn: 'first_published_post',
	},
	{
		id: 'add-first-product',
		title: 'Add your first product',
		subtitle: 'Listed products turn a store into a sellable site.',
		category: 'activation',
		goals: [ 'sell' ],
		hideWhen: { hasProduct: true },
		url: ( s ) => `/woocommerce-installation/${ s }`,
		cta: 'Add product',
		completesOn: 'first_product',
	},
	{
		id: 'design-homepage',
		title: 'Design your homepage',
		subtitle: 'The first thing visitors see — make it count.',
		category: 'activation',
		goals: [ 'build', 'portfolio', 'educate' ],
		hideWhen: { isLaunched: true },
		url: ( s ) => `/site-editor/${ s }`,
		cta: 'Edit site',
	},
	{
		id: 'add-portfolio-piece',
		title: 'Add your first portfolio piece',
		subtitle: 'A portfolio without work is just a coming-soon page.',
		category: 'activation',
		goals: [ 'portfolio' ],
		// No `hideWhen` — having a regular post or page doesn't prove the
		// user has published a portfolio piece, so the previous rule
		// (hide-if-hasPosts-OR-hasPages) was hiding this task on most test
		// sites by accident.
		url: ( s ) => `/post/${ s }?type=jetpack-portfolio`,
		cta: 'Add piece',
	},
	{
		id: 'send-first-newsletter',
		title: 'Send your first newsletter',
		subtitle: 'Reach the inbox you came here to reach.',
		category: 'activation',
		goals: [ 'newsletter' ],
		hideWhen: { hasPosts: true },
		url: ( s ) => `/post/${ s }`,
		cta: 'Compose',
		completesOn: 'first_published_post',
	},
	{
		// AI-routed: when expanded, asks Dolly to recommend 3 themes from the
		// curated allowlist based on the wizard's `inferred` context (vibe /
		// niche / goal), then renders them with live iframe previews and a
		// one-click activate. Theme is the highest-leverage activation step —
		// it determines how every other piece of content lands.
		id: 'pick-theme',
		title: 'Choose a theme',
		subtitle: "Three themes picked for what you're building. One click activates.",
		category: 'activation',
		goals: GOALS_ALL,
		// No `hideWhen` for the POC — the task stays even after activation so
		// users can swap themes again. ThemePickerTaskItem could be extended
		// later to check the active theme and self-mark complete.
		url: ( s ) => `/themes/${ s }`,
		cta: 'Browse all themes',
	},
	{
		id: 'launch-site',
		title: 'Launch your site',
		subtitle: 'Take it public — but only after the steps above.',
		category: 'activation',
		goals: GOALS_ALL,
		hideWhen: { isLaunched: true },
		url: ( s ) => `/home/${ s }`,
		cta: 'Launch',
		completesOn: 'site_launched',
	},

	// ─── Feature setup (one per Feature checkbox, where the action is the
	// canonical setup path. Insight Index §2: plugin/feature choice is the
	// strongest causal accelerator we have — Woo adopters reach first sale
	// 42 days faster, plugin attribution = ~$1M/yr.)
	{
		id: 'setup-forms',
		title: 'Add a contact form',
		category: 'feature-setup',
		features: [ 'forms' ],
		url: ( s ) => `/page/${ s }?contact-form=1`,
		cta: 'Add form',
		createsPage: true,
	},
	{
		id: 'setup-newsletter-feature',
		title: 'Configure your newsletter',
		subtitle: 'Set the From name, sender email, and welcome message.',
		category: 'feature-setup',
		features: [ 'newsletter' ],
		url: ( s ) => `/settings/newsletter/${ s }`,
		cta: 'Open settings',
	},
	{
		id: 'setup-store',
		title: 'Set up your store',
		// Subtitle absorbs the framing previously on `discover-woocommerce`
		// (the data point from Insight Index §2). The two rows pointed at the
		// same action, so the discover variant is dropped client-side in
		// home-dashboard.tsx when this row is already in the picked list.
		subtitle: 'Stores that adopt WooCommerce early reach first sale 42 days sooner.',
		category: 'feature-setup',
		// Tagged for the sell GOAL as well as the store FEATURE: the wizard
		// collects no explicit features, so the deterministic selectTasks()
		// fallback needs the goal tag to surface the store step (theme → store
		// → product) without depending on Dolly.
		goals: [ 'sell' ],
		features: [ 'store' ],
		hideWhen: { pluginInstalled: 'woocommerce' },
		url: ( s ) => `/woocommerce-installation/${ s }`,
		cta: 'Install Woo',
	},
	{
		id: 'setup-bookings',
		title: 'Add an events page',
		subtitle: 'List your classes, sessions, and dates so visitors can sign up.',
		category: 'feature-setup',
		// Goal-tagged (same reason as setup-gallery) so a studio / promoter
		// reliably gets the events page even when Dolly's pick omits it.
		goals: [ 'educate', 'build' ],
		features: [ 'bookings' ],
		// Builds an Events page from a dotcompatterns "events" pattern with
		// Dolly-rewritten copy — a text-rich pattern, so the personalization is
		// clearly visible (unlike the image-led gallery). Note: this creates an
		// events/booking *landing page*, not real scheduling/availability — see
		// todo #10. `url` is the fallback if the page can't be created.
		pattern: { category: 'events', pageTitle: 'Events' },
		url: ( s ) => `/page/${ s }`,
		cta: 'Add events page',
	},
	{
		id: 'setup-gallery',
		title: 'Create your first gallery',
		subtitle: 'Show your work in a full-bleed image gallery.',
		category: 'feature-setup',
		// Goal-tagged so a visual site reliably gets the gallery even when Dolly's
		// pick omits it (see patternTaskIdsForGoal); the wizard collects no
		// explicit features, so the `gallery` feature alone never surfaces it.
		goals: [ 'portfolio', 'educate', 'build' ],
		features: [ 'gallery' ],
		// Builds a real Gallery page from a dotcompatterns gallery pattern. The
		// pattern is image-only, so `intro` adds a Dolly heading + lead paragraph
		// and `images` swaps the stock photos for niche-matched Openverse ones.
		// The `url` is the fallback if the page can't be created on click.
		pattern: { category: 'gallery', pageTitle: 'Gallery', intro: true, images: true },
		url: ( s ) => `/page/${ s }`,
		cta: 'Add gallery',
	},
	{
		id: 'setup-video',
		title: 'Add a video page',
		subtitle: 'Embed a reel, demo, or showreel on your site.',
		category: 'feature-setup',
		features: [ 'video' ],
		url: ( s ) => `/page/${ s }?video=1`,
		cta: 'Add video',
		createsPage: true,
	},
	{
		id: 'setup-memberships',
		title: 'Set up paid memberships',
		subtitle: 'Charge for access to posts, areas, or whole site.',
		category: 'feature-setup',
		features: [ 'memberships' ],
		url: ( s ) => `/earn/${ s }`,
		cta: 'Configure',
	},
	{
		id: 'setup-donations',
		title: 'Add a donations button',
		subtitle: 'Let supporters chip in without buying anything.',
		category: 'feature-setup',
		features: [ 'donations' ],
		url: ( s ) => `/earn/payments/${ s }`,
		cta: 'Add button',
	},

	// ─── Discover tips (one plugin/feature suggestion per Feature, with the
	// strongest single recommendation per slot. Insight Index §2: Elementor
	// for SMB, Yoast for Blog, Jetpack Forms / WooCommerce for stores —
	// plugin attribution concentrates in <10 names.)
	{
		id: 'discover-jetpack-forms',
		title: 'Try Jetpack Forms',
		subtitle: 'Free, native to WordPress, no plugin needed.',
		category: 'discover',
		features: [ 'forms' ],
		url: ( s ) => `/plugins/jetpack/${ s }`,
		cta: 'Learn more',
	},
	{
		id: 'discover-woocommerce',
		title: 'WooCommerce powers most WP stores',
		subtitle: 'Stores that adopt Woo early reach first sale 42 days sooner.',
		category: 'discover',
		features: [ 'store' ],
		hideWhen: { pluginInstalled: 'woocommerce' },
		url: ( s ) => `/plugins/woocommerce/${ s }`,
		cta: 'Install',
	},
	{
		id: 'discover-yoast-seo',
		title: 'Improve discoverability with Yoast SEO',
		subtitle: 'Helps your posts and products show up on Google.',
		category: 'discover',
		goals: [ 'write', 'sell', 'educate' ],
		hideWhen: { pluginInstalled: 'wordpress-seo' },
		url: ( s ) => `/plugins/wordpress-seo/${ s }`,
		cta: 'Install',
	},
	{
		id: 'discover-elementor',
		title: 'Build pages visually with Elementor',
		subtitle: 'Most popular page builder among new WP.com small-business sites.',
		category: 'discover',
		goals: [ 'build', 'educate', 'portfolio' ],
		hideWhen: { pluginInstalled: 'elementor' },
		url: ( s ) => `/plugins/elementor/${ s }`,
		cta: 'Install',
	},
	{
		id: 'discover-woocommerce-bookings',
		title: 'Try WooCommerce Bookings',
		subtitle: 'Calendar-based appointments and class scheduling on top of Woo.',
		category: 'discover',
		features: [ 'bookings' ],
		url: ( s ) => `/plugins/woocommerce-bookings/${ s }`,
		cta: 'Install',
	},
	{
		id: 'discover-videopress',
		title: 'Host video with VideoPress',
		subtitle: 'Ad-free playback, responsive embeds, no YouTube branding.',
		category: 'discover',
		features: [ 'video' ],
		url: ( s ) => `/plugins/videopress/${ s }`,
		cta: 'Install',
	},

	// ─── Universal foundation tasks (regardless of input). These keep the
	// list at ≥5 even when a Goal/Features combo is sparse. Site-state-gated
	// so they drop off naturally once done.
	{
		id: 'add-site-icon',
		title: 'Add a site icon',
		subtitle: 'Shows up in browser tabs and bookmarks.',
		category: 'feature-setup',
		goals: GOALS_ALL,
		url: ( s ) => `/settings/general/${ s }`,
		cta: 'Upload icon',
	},
	{
		id: 'pick-fonts-colors',
		title: 'Customize fonts and colors',
		subtitle: 'Make the site feel like yours in two minutes.',
		category: 'feature-setup',
		goals: GOALS_ALL,
		// Deep-link straight to the Styles → Browse styles (variations) panel.
		// The /site-editor/:site route forwards `context.query` to wp-admin's
		// site-editor.php, and Gutenberg's site editor router is configured with
		// `pathArg="p"` (see @wordpress/edit-site/.../app/index.js), so `p=/styles`
		// opens the Styles sidebar. `section=/variations` drills one level deeper
		// into the style-variations grid — the actual "browse fonts and colors"
		// surface, two clicks closer to the job than the editor's default canvas.
		// Note: param name is `p` (NOT `path`), which the router ignores.
		url: ( s ) => `/site-editor/${ s }?p=/styles&section=/variations`,
		cta: 'Open editor',
	},
	{
		id: 'add-about-page',
		title: 'Add an About page',
		subtitle: 'Tell visitors who you are and what this site is for.',
		category: 'feature-setup',
		goals: GOALS_ALL,
		hideWhen: { hasPages: true },
		url: ( s ) => `/page/${ s }`,
		cta: 'Create page',
		createsPage: true,
	},
	{
		id: 'add-contact-page',
		title: 'Add a Contact page',
		subtitle: 'Make it easy for people to reach you.',
		category: 'feature-setup',
		goals: GOALS_ALL,
		url: ( s ) => `/page/${ s }`,
		cta: 'Create page',
		createsPage: true,
	},
	{
		id: 'connect-social-accounts',
		title: 'Connect your social accounts',
		subtitle: 'Auto-share new posts to where your audience already is.',
		category: 'feature-setup',
		goals: GOALS_ALL,
		url: ( s ) => `/marketing/connections/${ s }`,
		cta: 'Connect',
	},
	{
		id: 'discover-jetpack-stats',
		title: 'Turn on Jetpack Stats',
		subtitle: 'Privacy-friendly traffic insights, native to WordPress.',
		category: 'discover',
		goals: GOALS_ALL,
		url: ( s ) => `/stats/day/${ s }`,
		cta: 'Enable',
	},

	// ─── Growth (regardless of input). Insight Index §3: app-using signups
	// retain +25pp at D28; own-domain segment is 4% of signups but 32% of
	// 24h purchases; traffic = 31x multiplier on paid penetration. Surface
	// AFTER activation so they don't compete with the spine — see §4:
	// pre-activation upsells dismiss at 35–67%.
	{
		id: 'connect-custom-domain',
		title: 'Connect a custom domain',
		subtitle: 'Sites with their own domain convert ~32% within 24h.',
		category: 'growth',
		goals: GOALS_ALL,
		hideWhen: { hasCustomDomain: true },
		url: ( s ) => `/domains/add/${ s }`,
		cta: 'Choose domain',
		completesOn: 'custom_domain_connected',
	},
	{
		id: 'install-mobile-app',
		title: 'Get the Jetpack mobile app',
		subtitle: 'Mobile users stay active 25pp longer at day 28.',
		category: 'growth',
		goals: GOALS_ALL,
		// Calypso's in-app "Get Apps" page (links to the stores / shows the QR)
		// instead of jetpack.com — keeps the task inside Calypso.
		url: () => '/me/get-apps',
		cta: 'Download',
	},
	{
		id: 'review-stats',
		title: 'Review your traffic',
		subtitle: 'Sites with even 1 view/week convert at 31× the zero-view rate.',
		category: 'growth',
		goals: GOALS_ALL,
		hideWhen: { isLaunched: false },
		url: ( s ) => `/stats/day/${ s }`,
		cta: 'See stats',
	},
];
