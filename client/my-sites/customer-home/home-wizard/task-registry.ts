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

	/** Calypso URL with `:slug` placeholder. */
	url: ( slug: string ) => string;
	cta: string;

	/** Used to detect "done" without round-tripping the server. */
	completesOn?: ActivationSignal;
};

const GOALS_ALL: GoalKey[] = [ 'write', 'build', 'sell', 'newsletter', 'promote', 'portfolio' ];

export const TASK_REGISTRY: TaskTemplate[] = [
	// ─── Activation core (the spine; closes the loop on the pitch's
	// "meaningful first action" metric — see Insight Index §3:
	// "27% complete setup but only 10% publish, 17pp gap to close".)
	{
		id: 'publish-first-post',
		title: 'Publish your first post',
		subtitle: 'Share something. Real publish, not a draft.',
		category: 'activation',
		goals: [ 'write', 'newsletter', 'promote' ],
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
		goals: [ 'build', 'portfolio', 'promote' ],
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
		subtitle: 'Payments, shipping, and tax in one place.',
		category: 'feature-setup',
		features: [ 'store' ],
		hideWhen: { pluginInstalled: 'woocommerce' },
		url: ( s ) => `/woocommerce-installation/${ s }`,
		cta: 'Install Woo',
	},
	{
		id: 'setup-bookings',
		title: 'Set up bookings',
		subtitle: 'Take appointments, sessions, or class signups directly on your site.',
		category: 'feature-setup',
		features: [ 'bookings' ],
		url: ( s ) => `/woocommerce-installation/${ s }`,
		cta: 'Set up bookings',
	},
	{
		id: 'setup-gallery',
		title: 'Create your first gallery',
		subtitle: 'Show your work in a full-bleed image gallery.',
		category: 'feature-setup',
		features: [ 'gallery' ],
		url: ( s ) => `/page/${ s }?gallery=1`,
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
		goals: [ 'write', 'sell', 'promote' ],
		hideWhen: { pluginInstalled: 'wordpress-seo' },
		url: ( s ) => `/plugins/wordpress-seo/${ s }`,
		cta: 'Install',
	},
	{
		id: 'discover-elementor',
		title: 'Build pages visually with Elementor',
		subtitle: 'Most popular page builder among new WP.com small-business sites.',
		category: 'discover',
		goals: [ 'build', 'promote', 'portfolio' ],
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
		id: 'set-site-title-tagline',
		title: 'Set a clear title and tagline',
		subtitle: 'The first thing visitors and search engines read.',
		category: 'feature-setup',
		goals: GOALS_ALL,
		url: ( s ) => `/settings/general/${ s }`,
		cta: 'Open settings',
	},
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
		url: ( s ) => `/site-editor/${ s }`,
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
	},
	{
		id: 'add-contact-page',
		title: 'Add a Contact page',
		subtitle: 'Make it easy for people to reach you.',
		category: 'feature-setup',
		goals: GOALS_ALL,
		url: ( s ) => `/page/${ s }`,
		cta: 'Create page',
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
		url: () => 'https://jetpack.com/app/',
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
