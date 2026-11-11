/**
 * Local-only prototype data, backed by real Studio sites. Each mock site maps
 * to a running Studio site (localhost port) carrying the untangling-prototype
 * mu-plugin; name and icon are hydrated live from its REST API, with the
 * static values below as fallback when a site isn't running. WP.com-level
 * data (plan, storage, domains) is read from the mu-plugin's
 * `untangling/v1/site` route, so the wp-admin Plan segment drives both
 * surfaces; the static values below stand in while a site is offline.
 */
import {
	getPersistQueryClientPromise,
	queryClient,
	siteAdminBarQuery,
	siteByIdQuery,
	siteBySlugQuery,
	siteCurrentPlanQuery,
	siteLastFiveActivityLogEntriesQuery,
	siteEnvironmentPHPVersionQuery,
	siteMediaStorageQuery,
	sitePreviewLinksQuery,
	sitePurchasesQuery,
	siteRedirectQuery,
	siteSettingsQuery,
	sslDetailsQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import apertureDiariesPreview from 'calypso/assets/images/untangling-previews/aperture-diaries.jpg';
import castIronSupplyPreview from 'calypso/assets/images/untangling-previews/castironsupply.jpg';
import coreCoworkingPreview from 'calypso/assets/images/untangling-previews/corecoworking.jpg';
import openOceanPreview from 'calypso/assets/images/untangling-previews/open-ocean.jpg';
import paperFoxPrintsPreview from 'calypso/assets/images/untangling-previews/paperfoxprints.jpg';
import slowMorningsPreview from 'calypso/assets/images/untangling-previews/slow-mornings.jpg';
import { getActivityLogHiddenGroups } from '../../utils/site-features';
import type {
	ActivityLogEntry,
	AdminBarNode,
	DomainSummary,
	Site,
	SiteContextualPlan,
} from '@automattic/api-core';

export type BloggerTier = 'free' | 'personal' | 'premium' | 'business' | 'commerce';

const MB = 1024 * 1024;
const GB = 1024 * MB;

interface MockSiteInput {
	ID: number;
	slug: string;
	name: string;
	/** The Studio site backing this mock (live preview, WP Admin, hydration). */
	localUrl: string;
	/** Playground blueprint standing in for the Studio wp-admin on a remote MSD (calypso.live). */
	playgroundUrl: string;
	/** Static homepage screenshot shown instead of the live iframe on a remote MSD. */
	previewImage: string;
	/** Static fallback; overwritten by the Studio site's live plan on hydration. */
	tier: BloggerTier;
	subscribersCount: number;
	storageUsedBytes: number;
	maxStorageBytes: number;
	/** The address the site answers at: the custom domain on paid plans. */
	primaryDomain: string;
	/** The free wordpress.com address every site keeps. */
	wpcomDomain: string;
	/** The custom domain offered to a Free site. */
	upsellDomain: string;
	/** ISO date the plan (and its domain) renews; null on Free. */
	renewalDate: string | null;
	/** Only shown in the solo-blogger persona (?persona=blogger). */
	solo?: boolean;
	/** Live omnibar offer from the Studio site (`untangling/v1/upsell`), when one is active. */
	offer?: MockOmnibarOffer | null;
}

interface MockOmnibarOffer {
	active: boolean;
	pill: string;
	text: string;
	gem: boolean;
	href: string;
}

// A spec-shaped admin base URL (trailing slash), so consumers concatenating
// `${ admin_url }foo.php` build valid deep links into the Studio wp-admin.
function localAdminUrl( localUrl: string ): string {
	return `${ localUrl }/wp-admin/`;
}

/**
 * Where the primary "WP Admin" CTAs land for a Studio-backed site: the
 * untangled all-in Dashboard (index.php). On a remote MSD this resolves to
 * the site's Playground stand-in; non-local admin URLs pass through untouched.
 */
export function siteWpAdminLandingUrl( adminUrl: string | undefined ): string | undefined {
	return wpAdminPageUrl( adminUrl, 'index.php' ) ?? adminUrl;
}

/**
 * Whether the MSD half of the prototype is served away from the dev machine
 * (calypso.live). The Studio sites are unreachable there, so WP Admin links
 * open per-site Playground blueprints and previews use static screenshots.
 */
export function isRemoteMsd(): boolean {
	return typeof window !== 'undefined' && ! window.location.hostname.endsWith( '.localhost' );
}

/**
 * Builds `${origin}/wp-admin/<path>` for local Studio sites; undefined
 * otherwise. On a remote MSD the Studio wp-admin is stood in for by the
 * site's Playground blueprint — deep links collapse onto its landing page.
 */
export function wpAdminPageUrl( adminUrl: string | undefined, path: string ): string | undefined {
	if ( ! adminUrl ) {
		return undefined;
	}
	try {
		const origin = new URL( adminUrl ).origin;
		if ( isRemoteMsd() ) {
			return playgroundUrlForOrigin( origin );
		}
		if ( isLocalWpAdminOrigin( origin ) ) {
			return `${ origin }/wp-admin/${ path }`;
		}
	} catch {
		return undefined;
	}
	return undefined;
}

/** On a remote MSD, the Playground stand-in for a mock site's own URL. */
export function mockSiteRemoteUrl( url: string | undefined ): string | undefined {
	if ( ! url || ! isRemoteMsd() ) {
		return undefined;
	}
	try {
		return playgroundUrlForOrigin( new URL( url ).origin );
	} catch {
		return undefined;
	}
}

/** Static screenshot for a mock site's preview when the MSD runs remotely. */
export function mockSitePreviewImage( url: string ): string | undefined {
	if ( ! isRemoteMsd() ) {
		return undefined;
	}
	try {
		return previewImageForOrigin( new URL( url ).origin );
	} catch {
		return undefined;
	}
}

const FREE_PLAN: NonNullable< Site[ 'plan' ] > = {
	product_id: 1,
	product_slug: 'free_plan',
	product_name: 'WordPress.com Free',
	product_name_short: 'Free',
	product_name_en: 'Free',
	expired: false,
	is_free: true,
	features: { active: [] },
};

const PERSONAL_PLAN: NonNullable< Site[ 'plan' ] > = {
	product_id: 1009,
	product_slug: 'personal-bundle',
	product_name: 'WordPress.com Personal',
	product_name_short: 'Personal',
	product_name_en: 'Personal',
	expired: false,
	is_free: false,
	billing_period: 'Yearly',
	features: { active: [] },
};

const PREMIUM_PLAN: NonNullable< Site[ 'plan' ] > = {
	product_id: 1003,
	product_slug: 'value_bundle',
	product_name: 'WordPress.com Premium',
	product_name_short: 'Premium',
	product_name_en: 'Premium',
	expired: false,
	is_free: false,
	billing_period: 'Yearly',
	features: { active: [] },
};

const BUSINESS_PLAN: NonNullable< Site[ 'plan' ] > = {
	product_id: 1008,
	product_slug: 'business-bundle',
	product_name: 'WordPress.com Business',
	product_name_short: 'Business',
	product_name_en: 'Business',
	expired: false,
	is_free: false,
	billing_period: 'Yearly',
	features: { active: [] },
};

const COMMERCE_PLAN: NonNullable< Site[ 'plan' ] > = {
	product_id: 1011,
	product_slug: 'ecommerce-bundle',
	product_name: 'WordPress.com Commerce',
	product_name_short: 'Commerce',
	product_name_en: 'Commerce',
	expired: false,
	is_free: false,
	billing_period: 'Yearly',
	features: { active: [] },
};

export const PLAN_BY_TIER: Record< BloggerTier, NonNullable< Site[ 'plan' ] > > = {
	free: FREE_PLAN,
	personal: PERSONAL_PLAN,
	premium: PREMIUM_PLAN,
	business: BUSINESS_PLAN,
	commerce: COMMERCE_PLAN,
};

const TIER_BY_PRODUCT_SLUG = new Map< string, BloggerTier >(
	( Object.keys( PLAN_BY_TIER ) as BloggerTier[] ).map( ( tier ) => [
		PLAN_BY_TIER[ tier ].product_slug,
		tier,
	] )
);

function isBloggerTier( value: unknown ): value is BloggerTier {
	return typeof value === 'string' && value in PLAN_BY_TIER;
}

/** Only Business and Commerce run on Atomic; every lower plan is Simple-hosted. */
export function isAtomicTier( tier: BloggerTier ): tier is 'business' | 'commerce' {
	return tier === 'business' || tier === 'commerce';
}

function makeMockSite( input: MockSiteInput ): Site {
	return {
		ID: input.ID,
		slug: input.slug,
		name: input.name,
		URL: input.localUrl,
		plan: PLAN_BY_TIER[ input.tier ],
		capabilities: {
			manage_options: true,
			update_plugins: true,
			view_stats: true,
		},
		feed_ID: input.ID,
		feed_URL: `${ input.localUrl }/feed/`,
		subscribers_count: input.subscribersCount,
		options: {
			admin_url: localAdminUrl( input.localUrl ),
			created_at: '2025-09-14T10:00:00+00:00',
			updated_at: '2026-07-14T15:43:00+00:00',
			software_version: '7.0.1',
			site_intent: 'write',
			unmapped_url: input.localUrl,
		},
		is_a4a_dev_site: false,
		is_a8c: false,
		is_deleted: false,
		is_coming_soon: false,
		is_private: false,
		is_wpcom_atomic: isAtomicTier( input.tier ),
		is_wpcom_staging_site: false,
		is_vip: false,
		lang: 'en',
		launch_status: 'launched',
		site_migration: {
			in_progress: false,
			is_complete: false,
		},
		site_owner: 0,
		jetpack: false,
		jetpack_connection: false,
		jetpack_modules: null,
		was_ecommerce_trial: false,
		was_migration_trial: false,
		was_hosting_trial: false,
		was_upgraded_from_trial: false,
	};
}

const PLAYGROUND_BLUEPRINT_BASE =
	'https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/lucasmendes-design/untangling-playground/main';

// Ports assigned by the Studio app; tier, storage and domains mirror each
// site's 0-untangling-config.php so both surfaces tell the same story even
// before hydration (and on a remote MSD, where hydration is skipped).
const MOCK_SITE_INPUTS: MockSiteInput[] = [
	{
		ID: 900000004,
		slug: 'aperture-diaries.wordpress.com',
		name: 'Aperture Diaries',
		localUrl: 'http://localhost:8883',
		playgroundUrl: `${ PLAYGROUND_BLUEPRINT_BASE }/blueprint-aperture.json`,
		previewImage: apertureDiariesPreview,
		tier: 'free',
		subscribersCount: 214,
		storageUsedBytes: 0.7 * GB,
		maxStorageBytes: 1 * GB,
		primaryDomain: 'aperture-diaries.wordpress.com',
		wpcomDomain: 'aperture-diaries.wordpress.com',
		upsellDomain: 'aperture-diaries.com',
		renewalDate: null,
		solo: true,
	},
	{
		ID: 900000005,
		slug: 'castironsupply.com',
		name: 'Cast Iron Supply Co',
		localUrl: 'http://localhost:8885',
		playgroundUrl: `${ PLAYGROUND_BLUEPRINT_BASE }/blueprint-castiron.json`,
		previewImage: castIronSupplyPreview,
		tier: 'commerce',
		subscribersCount: 45,
		storageUsedBytes: 22.4 * GB,
		maxStorageBytes: 50 * GB,
		primaryDomain: 'castironsupply.com',
		wpcomDomain: 'castironsupply.wordpress.com',
		upsellDomain: 'castiron.shop',
		renewalDate: '2027-03-14',
	},
	{
		ID: 900000006,
		slug: 'corecoworking.com',
		name: 'Core Coworking',
		localUrl: 'http://localhost:8886',
		playgroundUrl: `${ PLAYGROUND_BLUEPRINT_BASE }/blueprint-coworking.json`,
		previewImage: coreCoworkingPreview,
		tier: 'business',
		subscribersCount: 12,
		storageUsedBytes: 41.8 * GB,
		maxStorageBytes: 50 * GB,
		primaryDomain: 'corecoworking.com',
		wpcomDomain: 'corecoworking.wordpress.com',
		upsellDomain: 'corecoworking.space',
		renewalDate: '2027-03-14',
	},
	{
		ID: 900000007,
		slug: 'open-ocean.wordpress.com',
		name: 'Open ocean',
		localUrl: 'http://localhost:8882',
		playgroundUrl: `${ PLAYGROUND_BLUEPRINT_BASE }/blueprint-openocean.json`,
		previewImage: openOceanPreview,
		tier: 'free',
		subscribersCount: 31,
		storageUsedBytes: 118 * MB,
		maxStorageBytes: 1 * GB,
		primaryDomain: 'open-ocean.wordpress.com',
		wpcomDomain: 'open-ocean.wordpress.com',
		upsellDomain: 'openocean.blog',
		renewalDate: null,
	},
	{
		ID: 900000008,
		slug: 'paperfoxprints.com',
		name: 'Paper Fox Prints',
		localUrl: 'http://localhost:8887',
		playgroundUrl: `${ PLAYGROUND_BLUEPRINT_BASE }/blueprint-paperfox.json`,
		previewImage: paperFoxPrintsPreview,
		tier: 'business',
		subscribersCount: 87,
		storageUsedBytes: 41.8 * GB,
		maxStorageBytes: 50 * GB,
		primaryDomain: 'paperfoxprints.com',
		wpcomDomain: 'paperfoxprints.wordpress.com',
		upsellDomain: 'paperfox.art',
		renewalDate: '2027-03-14',
	},
	{
		ID: 900000009,
		slug: 'slow-mornings.com',
		name: 'Slow Mornings',
		localUrl: 'http://localhost:8888',
		playgroundUrl: `${ PLAYGROUND_BLUEPRINT_BASE }/blueprint-slowmornings.json`,
		previewImage: slowMorningsPreview,
		tier: 'premium',
		subscribersCount: 156,
		storageUsedBytes: 4.2 * GB,
		maxStorageBytes: 13 * GB,
		primaryDomain: 'slow-mornings.com',
		wpcomDomain: 'slow-mornings.wordpress.com',
		upsellDomain: 'slowmornings.blog',
		renewalDate: '2027-03-14',
	},
];

export const MOCK_BLOGGER_SITES: Site[] = MOCK_SITE_INPUTS.map( makeMockSite );

export const SOLO_BLOGGER_SITE_SLUG = 'aperture-diaries.wordpress.com';

export function getMockSitesForPersona( persona: 'developer' | 'blogger' ): Site[] {
	const wantSolo = persona === 'blogger';
	return MOCK_SITE_INPUTS.filter( ( input ) => Boolean( input.solo ) === wantSolo ).map(
		( input ) => MOCK_BLOGGER_SITES.find( ( site ) => site.slug === input.slug ) as Site
	);
}

const MOCK_INPUT_BY_SLUG = new Map( MOCK_SITE_INPUTS.map( ( input ) => [ input.slug, input ] ) );
const MOCK_SITE_BY_SLUG = new Map(
	MOCK_BLOGGER_SITES.map( ( site ) => [ site.slug, site ] as const )
);

const LOCAL_WP_ADMIN_ORIGINS = new Set(
	MOCK_SITE_INPUTS.map( ( input ) => new URL( input.localUrl ).origin )
);

const PLAYGROUND_URL_BY_ORIGIN = new Map(
	MOCK_SITE_INPUTS.map( ( input ) => [ new URL( input.localUrl ).origin, input.playgroundUrl ] )
);

const PREVIEW_IMAGE_BY_ORIGIN = new Map(
	MOCK_SITE_INPUTS.map( ( input ) => [ new URL( input.localUrl ).origin, input.previewImage ] )
);

function playgroundUrlForOrigin( origin: string ): string | undefined {
	return PLAYGROUND_URL_BY_ORIGIN.get( origin );
}

function previewImageForOrigin( origin: string ): string | undefined {
	return PREVIEW_IMAGE_BY_ORIGIN.get( origin );
}

/** Whether an origin is one of the Studio sites backing the mock sites. */
export function isLocalWpAdminOrigin( origin: string ): boolean {
	return LOCAL_WP_ADMIN_ORIGINS.has( origin );
}

export function isMockBloggerSiteSlug( slug: string ): boolean {
	return MOCK_SITE_BY_SLUG.has( slug );
}

/** The tier a mock Site is on, read from its plan so static and hydrated state agree. */
function tierOfSite( site: Site ): BloggerTier {
	return TIER_BY_PRODUCT_SLUG.get( site.plan?.product_slug ?? '' ) ?? 'free';
}

export function getMockBloggerSite( slug: string ): { site: Site; tier: BloggerTier } | undefined {
	const site = MOCK_SITE_BY_SLUG.get( slug );
	if ( ! site ) {
		return undefined;
	}
	return { site, tier: tierOfSite( site ) };
}

/**
 * React-aware twin of getMockBloggerSite(): subscribes to the seeded
 * siteBySlugQuery entry, so a view that painted with the static tier
 * re-renders once hydration writes the Studio site's live plan.
 */
export function useMockBloggerSite( slug: string ): { site: Site; tier: BloggerTier } | undefined {
	const { data: site } = useQuery( {
		...siteBySlugQuery( slug ),
		enabled: isMockBloggerSiteSlug( slug ),
	} );
	if ( ! site || ! isMockBloggerSiteSlug( slug ) ) {
		return undefined;
	}
	return { site, tier: tierOfSite( site ) };
}

export function getMockBloggerStorage( slug: string ) {
	const input = MOCK_INPUT_BY_SLUG.get( slug );
	if ( ! input ) {
		return undefined;
	}
	return { usedBytes: input.storageUsedBytes, maxBytes: input.maxStorageBytes };
}

/**
 * What the mu-plugin's `untangling/v1/site` route returns: the plan the
 * wp-admin Prototype controls persisted, with everything that follows from it.
 */
interface StudioSiteSnapshot {
	plan: string;
	tier: string;
	product_slug: string;
	plan_rank: number;
	site_type: 'atomic' | 'simple';
	storage: { used_bytes: number; max_bytes: number };
	domains: { primary: string; wpcom: string; upsell: string };
	renewal_date: string | null;
	site_name?: string;
	site_url?: string;
}

/**
 * Applies a Studio site's live plan to the shared mock input and Site. The
 * slug, URL and admin_url never change: routes, live previews, omnibar origin
 * matching and the Playground maps are keyed on them.
 */
function applyStudioSnapshot( input: MockSiteInput, site: Site, snapshot: StudioSiteSnapshot ) {
	if ( ! isBloggerTier( snapshot.tier ) ) {
		return;
	}
	input.tier = snapshot.tier;
	if ( snapshot.storage ) {
		input.storageUsedBytes = Number( snapshot.storage.used_bytes ) || input.storageUsedBytes;
		input.maxStorageBytes = Number( snapshot.storage.max_bytes ) || input.maxStorageBytes;
	}
	if ( snapshot.domains ) {
		input.primaryDomain = snapshot.domains.primary || input.primaryDomain;
		input.wpcomDomain = snapshot.domains.wpcom || input.wpcomDomain;
		input.upsellDomain = snapshot.domains.upsell || input.upsellDomain;
	}
	input.renewalDate = snapshot.renewal_date ?? null;
	site.plan = PLAN_BY_TIER[ snapshot.tier ];
	site.is_wpcom_atomic = snapshot.site_type
		? snapshot.site_type === 'atomic'
		: isAtomicTier( snapshot.tier );
}

/**
 * Hydrates the mock sites with live data from their Studio sites: title and
 * icon from the REST index, plan / storage / domains from the mu-plugin's
 * `untangling/v1/site` route. Mutates the shared Site objects in place, then
 * refreshes the seeded query-cache entries so open views re-render. A site
 * that isn't running keeps its static fallback values — the demo never breaks.
 */
let hydrationPromise: Promise< void > | undefined;

export function hydrateMockBloggerSites(): Promise< void > {
	if ( isRemoteMsd() ) {
		// The Studio sites only exist on the dev machine; the static mocks are
		// the whole story remotely, and http fetches would log mixed-content noise.
		return Promise.resolve();
	}
	if ( ! hydrationPromise ) {
		hydrationPromise = Promise.all(
			MOCK_SITE_INPUTS.map( async ( input ) => {
				const site = MOCK_SITE_BY_SLUG.get( input.slug ) as Site;
				try {
					const controller = new AbortController();
					const timer = setTimeout( () => controller.abort(), 2500 );
					const [ response, snapshotResponse, offerResponse ] = await Promise.all( [
						fetch( `${ input.localUrl }/wp-json/`, { signal: controller.signal } ),
						fetch( `${ input.localUrl }/wp-json/untangling/v1/site`, {
							signal: controller.signal,
						} ).catch( () => undefined ),
						fetch( `${ input.localUrl }/wp-json/untangling/v1/upsell`, {
							signal: controller.signal,
						} ).catch( () => undefined ),
					] );
					clearTimeout( timer );
					if ( response.ok ) {
						const data: { name?: string; site_icon_url?: string } = await response.json();
						if ( data.name ) {
							site.name = data.name;
						}
						if ( data.site_icon_url ) {
							site.icon = { img: data.site_icon_url, ico: data.site_icon_url };
						}
					}
					if ( snapshotResponse?.ok ) {
						const snapshot: StudioSiteSnapshot = await snapshotResponse.json();
						applyStudioSnapshot( input, site, snapshot );
					}
					input.offer = offerResponse?.ok ? await offerResponse.json() : null;
				} catch {
					// Studio site not running; the static mock stands in.
				}
			} )
		).then( () => undefined );
	}
	return hydrationPromise;
}

const TIER_YEARLY_PRICE: Record< BloggerTier, number > = {
	free: 0,
	personal: 48,
	premium: 96,
	business: 300,
	commerce: 540,
};

function makeMockCurrentPlan( input: MockSiteInput ): SiteContextualPlan {
	const price = TIER_YEARLY_PRICE[ input.tier ];
	const plan = PLAN_BY_TIER[ input.tier ];
	return {
		formatted_original_price: `$${ price }`,
		original_price: { amount: price, currency: 'USD' },
		raw_price: price,
		raw_price_integer: price * 100,
		formatted_price: `$${ price }`,
		raw_discount: 0,
		raw_discount_integer: 0,
		formatted_discount: '$0',
		currency_code: 'USD',
		product_id: plan.product_id,
		product_slug: plan.product_slug,
		product_name: plan.product_name ?? plan.product_name_short,
		expiry: input.renewalDate ?? undefined,
		discount_reason: null,
		cost_overrides: [],
		is_domain_upgrade: false,
		current_plan: true,
		id: null,
	};
}

// Feeds the production Latest activity card on the standard site overview.
interface MockActivityInput {
	text: string;
	summary: string;
	gridicon: string;
	daysAgo: number;
	system?: boolean;
}

const TIER_ACTIVITY_LOG: Record< BloggerTier, MockActivityInput[] > = {
	free: [
		{ text: 'The first light of day', summary: 'Post published', gridicon: 'posts', daysAgo: 1 },
		{
			text: 'Your first reader subscribed',
			summary: 'New subscriber',
			gridicon: 'multiple-users',
			daysAgo: 2,
			system: true,
		},
		{ text: 'Uploaded 6 new photos', summary: 'Media uploaded', gridicon: 'image', daysAgo: 3 },
		{ text: 'About', summary: 'Page created', gridicon: 'pages', daysAgo: 4 },
		{
			text: 'Your site went live',
			summary: 'Site launched',
			gridicon: 'published',
			daysAgo: 7,
			system: true,
		},
	],
	personal: [
		{
			text: 'Notes from the kitchen table',
			summary: 'Post published',
			gridicon: 'posts',
			daysAgo: 1,
		},
		{
			text: 'Your domain is now connected',
			summary: 'Domain active',
			gridicon: 'domains',
			daysAgo: 3,
			system: true,
		},
		{ text: 'Uploaded 5 new photos', summary: 'Media uploaded', gridicon: 'image', daysAgo: 5 },
	],
	premium: [
		{ text: 'Slow mornings in Lisbon', summary: 'Post published', gridicon: 'posts', daysAgo: 1 },
		{
			text: '3 people subscribed to your newsletter',
			summary: 'New subscribers',
			gridicon: 'multiple-users',
			daysAgo: 2,
			system: true,
		},
		{ text: 'Uploaded 4 new photos', summary: 'Media uploaded', gridicon: 'image', daysAgo: 4 },
	],
	business: [
		{ text: 'Homepage', summary: 'Page updated', gridicon: 'pages', daysAgo: 1 },
		{
			text: 'Plugins updated to their latest versions',
			summary: 'Plugins updated',
			gridicon: 'plugins',
			daysAgo: 2,
			system: true,
		},
		{ text: 'Received a new comment', summary: 'New comment', gridicon: 'comment', daysAgo: 3 },
	],
	commerce: [
		{ text: 'Published a new product', summary: 'Product published', gridicon: 'cart', daysAgo: 1 },
		{
			text: 'WooCommerce updated to its latest version',
			summary: 'Plugin updated',
			gridicon: 'plugins',
			daysAgo: 3,
			system: true,
		},
		{
			text: 'Received a new order',
			summary: 'New order',
			gridicon: 'cart',
			daysAgo: 4,
			system: true,
		},
	],
};

function makeMockActivityEntries( input: MockSiteInput ): ActivityLogEntry[] {
	return TIER_ACTIVITY_LOG[ input.tier ].map( ( item, index ) => {
		const published = new Date( Date.now() - item.daysAgo * 24 * 60 * 60 * 1000 ).toISOString();
		return {
			activity_id: `mock-${ input.ID }-${ index }`,
			actor: item.system
				? { type: 'Application' as const, name: 'WordPress' }
				: { type: 'Person' as const, name: 'Lucas Mendes' },
			content: { text: item.text },
			type: 'Announce' as const,
			gridicon: item.gridicon,
			last_published: published,
			name: 'mock__activity',
			is_rewindable: false,
			published,
			rewind_id: '',
			status: null,
			summary: item.summary,
			streams: [],
		};
	} );
}

function getMockActivityLogQueryKey( input: MockSiteInput ) {
	const site = MOCK_SITE_BY_SLUG.get( input.slug ) as Site;
	return siteLastFiveActivityLogEntriesQuery( input.ID, getActivityLogHiddenGroups( site ) )
		.queryKey;
}

function getMockQueryKeys( input: MockSiteInput ) {
	return [
		siteBySlugQuery( input.slug ).queryKey,
		siteByIdQuery( input.ID ).queryKey,
		siteMediaStorageQuery( input.ID ).queryKey,
		siteCurrentPlanQuery( input.ID ).queryKey,
		getMockActivityLogQueryKey( input ),
		siteSettingsQuery( input.ID ).queryKey,
		siteRedirectQuery( input.ID ).queryKey,
		sitePreviewLinksQuery( input.ID ).queryKey,
		siteAdminBarQuery( input.ID ).queryKey,
		sitePurchasesQuery( input.ID ).queryKey,
		siteEnvironmentPHPVersionQuery( input.ID ).queryKey,
	];
}

function defaultAddressDomain( input: MockSiteInput, primary: boolean ): DomainSummary {
	return {
		domain: input.wpcomDomain,
		subtype: { id: 'default_address', label: 'Default site address' },
		blog_id: input.ID,
		blog_name: input.name,
		site_slug: input.slug,
		auto_renewing: false,
		current_user_is_owner: true,
		is_domain_only_site: false,
		expiry: null,
		expired: false,
		primary_domain: primary,
		can_set_as_primary: false,
		domain_status: { id: 'active', label: 'Active', type: 'success' },
		subscription_id: null,
		tags: [],
		wpcom_domain: true,
		type: 'wpcom',
		current_user_can_manage: true,
		has_registration: false,
	} as unknown as DomainSummary;
}

// subscription_id stays null on purpose: with one set, the name links to the
// domain overview, whose loaders hit real APIs for a domain that doesn't exist.
function registrationDomain( input: MockSiteInput ): DomainSummary {
	return {
		domain: input.primaryDomain,
		subtype: { id: 'domain_registration', label: 'Domain registration' },
		blog_id: input.ID,
		blog_name: input.name,
		site_slug: input.slug,
		auto_renewing: true,
		current_user_is_owner: true,
		is_domain_only_site: false,
		expiry: input.renewalDate ? `${ input.renewalDate }T00:00:00+00:00` : null,
		expired: false,
		primary_domain: true,
		can_set_as_primary: false,
		domain_status: { id: 'active', label: 'Active', type: 'success' },
		subscription_id: null,
		tags: [],
		wpcom_domain: false,
		type: 'mapping',
		current_user_can_manage: true,
		has_registration: true,
	} as unknown as DomainSummary;
}

/**
 * Every mock site keeps its free wpcom address; paid plans add the custom
 * domain as the primary (free for a year, renews with the plan). Feeds the
 * /domains list, each site's Domains page and the overview Domains card
 * (all filter the account-level list by blog_id). Read lazily — after
 * hydration — so the rows follow the Studio site's live plan.
 */
export function getMockDomains(): DomainSummary[] {
	return MOCK_SITE_INPUTS.flatMap( ( input ) =>
		input.tier === 'free'
			? [ defaultAddressDomain( input, true ) ]
			: [ registrationDomain( input ), defaultAddressDomain( input, false ) ]
	);
}

/**
 * The site half of the omnibar. Production builds it from the site's wp-admin
 * admin bar (`wpcom/v2/sites/:id/admin-bar`), which does not exist for a mock
 * id; this mirrors the nodes a WordPress.com site sends: site name, updates,
 * comments, + New, and the upsell pill when the Studio site has an offer on.
 */
function makeMockSiteAdminBar( input: MockSiteInput, site: Site ): AdminBarNode[] {
	const adminUrl = site.options?.admin_url;
	const admin = ( path: string ) => wpAdminPageUrl( adminUrl, path ) ?? '';
	const node = (
		id: string,
		title: string,
		href: string,
		parent: string | false = false,
		meta?: AdminBarNode[ 'meta' ]
	): AdminBarNode => ( { id, title, href, parent, group: false, meta } );
	const icon = site.icon?.img ? `<img src="${ site.icon.img }" alt="" />` : '';
	const nodes: AdminBarNode[] = [
		node( 'site-name', `${ icon }${ site.name }`, mockSiteRemoteUrl( site.URL ) ?? site.URL ),
		node( 'view-site', 'Visit Site', mockSiteRemoteUrl( site.URL ) ?? site.URL, 'site-name' ),
		node(
			'updates',
			'<span class="ab-label">5</span><span class="screen-reader-text">5 updates available</span>',
			admin( 'update-core.php' )
		),
		node(
			'comments',
			'<span class="ab-label pending-count">0</span><span class="screen-reader-text">0 Comments in moderation</span>',
			admin( 'edit-comments.php' )
		),
		node( 'new-content', 'New', admin( 'post-new.php' ) ),
		node( 'new-post', 'Post', admin( 'post-new.php' ), 'new-content' ),
		node( 'new-media', 'Media', admin( 'media-new.php' ), 'new-content' ),
		node( 'new-page', 'Page', admin( 'post-new.php?post_type=page' ), 'new-content' ),
	];
	if ( input.offer?.active ) {
		nodes.push(
			node( 'free-domain-upsell', input.offer.pill, input.offer.href, false, {
				title: input.offer.text,
			} )
		);
	}
	return nodes;
}

function writeMockSiteCaches() {
	for ( const input of MOCK_SITE_INPUTS ) {
		const site = MOCK_SITE_BY_SLUG.get( input.slug ) as Site;
		queryClient.setQueryData( siteBySlugQuery( input.slug ).queryKey, { ...site } );
		queryClient.setQueryData( siteByIdQuery( input.ID ).queryKey, { ...site } );
		queryClient.setQueryData( siteMediaStorageQuery( input.ID ).queryKey, {
			max_storage_bytes_from_add_ons: 0,
			max_storage_bytes: input.maxStorageBytes,
			storage_used_bytes: input.storageUsedBytes,
		} );
		queryClient.setQueryData(
			siteCurrentPlanQuery( input.ID ).queryKey,
			makeMockCurrentPlan( input )
		);
		const activityLogs = makeMockActivityEntries( input );
		queryClient.setQueryData( getMockActivityLogQueryKey( input ), {
			activityLogs,
			totalItems: activityLogs.length,
			pages: 1,
			itemsPerPage: 20,
			totalPages: 1,
		} );
		queryClient.setQueryData( siteSettingsQuery( input.ID ).queryKey, {
			blog_public: 1,
			wpcom_public_coming_soon: 0,
			wpcom_coming_soon: 0,
			gmt_offset: -3,
			timezone_string: 'America/Sao_Paulo',
		} );
		queryClient.setQueryData( siteRedirectQuery( input.ID ).queryKey, {} );
		queryClient.setQueryData( sitePreviewLinksQuery( input.ID ).queryKey, [] );
		queryClient.setQueryData( siteAdminBarQuery( input.ID ).queryKey, {
			nodes: makeMockSiteAdminBar( input, site ),
		} );
		queryClient.setQueryData( sitePurchasesQuery( input.ID ).queryKey, [] );
		// Production now shows the PHP version on Simple sites too.
		queryClient.setQueryData( siteEnvironmentPHPVersionQuery( input.ID ).queryKey, '8.3' );
		// The custom domain's SSL column reads a per-domain query that would hit
		// the real API (and read "SSL pending"); a registered mock domain is secure.
		if ( input.tier !== 'free' ) {
			const sslKey = sslDetailsQuery( input.primaryDomain ).queryKey;
			queryClient.setQueryDefaults( sslKey, {
				staleTime: Infinity,
				gcTime: Infinity,
				retry: false,
			} );
			queryClient.setQueryData( sslKey, {
				certificate_provisioned: true,
				is_newly_registered: false,
				is_expired: false,
			} );
		}
	}
}

/**
 * Seeds the query cache so route loaders (siteBySlugQuery, siteMediaStorageQuery,
 * siteCurrentPlanQuery) resolve mock sites without hitting the API. The seeded
 * entries have no observers, so they must be pinned (gcTime/staleTime Infinity)
 * or TanStack garbage-collects them after ~5 minutes and the loaders fall
 * through to real requests that 404. Data is written after the persisted cache
 * is restored, or the restore would overwrite the seeds.
 */
export function seedMockBloggerSiteCaches() {
	for ( const input of MOCK_SITE_INPUTS ) {
		for ( const queryKey of getMockQueryKeys( input ) ) {
			queryClient.setQueryDefaults( queryKey, { staleTime: Infinity, gcTime: Infinity } );
		}
		// Anything site-scoped that is not seeded above would 404 against the
		// real API (the mock IDs don't exist there) — at least don't retry.
		queryClient.setQueryDefaults( [ 'site', input.ID ], { retry: false } );
	}

	getPersistQueryClientPromise().then( () => {
		writeMockSiteCaches();
		hydrateMockBloggerSites().then( () => {
			writeMockSiteCaches();
			// A domains result fetched (or restored from the persisted cache)
			// before hydration landed still carries the static tiers.
			// Only the domains list itself: the seeded per-domain SSL entries
			// (`[ 'domains', name, 'ssl' ]`) must not refetch against the real API.
			queryClient.invalidateQueries( {
				predicate: ( query ) => query.queryKey[ 0 ] === 'domains' && query.queryKey.length === 2,
			} );
		} );
	} );
}
