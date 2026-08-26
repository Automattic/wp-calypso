/**
 * Local-only prototype data, backed by real Studio sites. Each mock site maps
 * to a running Studio site (localhost port) carrying the untangling-prototype
 * mu-plugin; name and icon are hydrated live from its REST API, with the
 * static values below as fallback when a site isn't running. WP.com-level
 * data (plan, storage) stays mocked — Studio sites can't provide it.
 */
import {
	getPersistQueryClientPromise,
	queryClient,
	siteByIdQuery,
	siteBySlugQuery,
	siteCurrentPlanQuery,
	siteLastFiveActivityLogEntriesQuery,
	siteMediaStorageQuery,
	sitePreviewLinksQuery,
	siteRedirectQuery,
	siteSettingsQuery,
} from '@automattic/api-queries';
import apertureDiariesPreview from 'calypso/assets/images/untangling-previews/aperture-diaries.jpg';
import castIronSupplyPreview from 'calypso/assets/images/untangling-previews/castironsupply.jpg';
import coreCoworkingPreview from 'calypso/assets/images/untangling-previews/corecoworking.jpg';
import openOceanPreview from 'calypso/assets/images/untangling-previews/open-ocean.jpg';
import paperFoxPrintsPreview from 'calypso/assets/images/untangling-previews/paperfoxprints.jpg';
import slowMorningsPreview from 'calypso/assets/images/untangling-previews/slow-mornings.jpg';
import { getActivityLogHiddenGroups } from '../../utils/site-features';
import type {
	ActivityLogEntry,
	DomainSummary,
	Site,
	SiteContextualPlan,
} from '@automattic/api-core';

export type BloggerTier = 'free' | 'premium' | 'business' | 'commerce';

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
	tier: BloggerTier;
	plan: NonNullable< Site[ 'plan' ] >;
	isAtomic?: boolean;
	subscribersCount: number;
	storageUsedBytes: number;
	maxStorageBytes: number;
	/** Only shown in the solo-blogger persona (?persona=blogger). */
	solo?: boolean;
}

// A spec-shaped admin base URL (trailing slash), so consumers concatenating
// `${ admin_url }foo.php` build valid deep links into the Studio wp-admin.
function localAdminUrl( localUrl: string ): string {
	return `${ localUrl }/wp-admin/`;
}

/**
 * Where the primary "WP Admin" CTAs land for a Studio-backed site: the My Site
 * page of the untangled wp-admin, not the stock Dashboard. Non-local admin
 * URLs pass through untouched.
 */
export function siteWpAdminLandingUrl( adminUrl: string | undefined ): string | undefined {
	return wpAdminPageUrl( adminUrl, 'admin.php?page=untangling-mysite' ) ?? adminUrl;
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

function makeMockSite( input: MockSiteInput ): Site {
	return {
		ID: input.ID,
		slug: input.slug,
		name: input.name,
		URL: input.localUrl,
		plan: input.plan,
		capabilities: {
			manage_options: true,
			update_plugins: true,
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
		is_wpcom_atomic: input.isAtomic ?? false,
		is_wpcom_flex: false,
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
		is_garden: false,
		garden_name: null,
		garden_partner: null,
		garden_is_provisioned: null,
	};
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

const PLAYGROUND_BLUEPRINT_BASE =
	'https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/lucasmendes-design/untangling-playground/main';

// Ports assigned by the Studio app; storage/plan mirror each site's
// 0-untangling-config.php so both surfaces tell the same story.
const MOCK_SITE_INPUTS: MockSiteInput[] = [
	{
		ID: 900000004,
		slug: 'aperture-diaries.wordpress.com',
		name: 'Aperture Diaries',
		localUrl: 'http://localhost:8883',
		playgroundUrl: `${ PLAYGROUND_BLUEPRINT_BASE }/blueprint-aperture.json`,
		previewImage: apertureDiariesPreview,
		tier: 'free',
		plan: FREE_PLAN,
		subscribersCount: 214,
		storageUsedBytes: 0.7 * GB,
		maxStorageBytes: 1 * GB,
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
		plan: COMMERCE_PLAN,
		isAtomic: true,
		subscribersCount: 45,
		storageUsedBytes: 22.4 * GB,
		maxStorageBytes: 50 * GB,
	},
	{
		ID: 900000006,
		slug: 'corecoworking.com',
		name: 'Core Coworking',
		localUrl: 'http://localhost:8886',
		playgroundUrl: `${ PLAYGROUND_BLUEPRINT_BASE }/blueprint-coworking.json`,
		previewImage: coreCoworkingPreview,
		tier: 'business',
		plan: BUSINESS_PLAN,
		isAtomic: true,
		subscribersCount: 12,
		storageUsedBytes: 41.8 * GB,
		maxStorageBytes: 50 * GB,
	},
	{
		ID: 900000007,
		slug: 'open-ocean.wordpress.com',
		name: 'Open ocean',
		localUrl: 'http://localhost:8882',
		playgroundUrl: `${ PLAYGROUND_BLUEPRINT_BASE }/blueprint-openocean.json`,
		previewImage: openOceanPreview,
		tier: 'free',
		plan: FREE_PLAN,
		subscribersCount: 31,
		storageUsedBytes: 118 * MB,
		maxStorageBytes: 1 * GB,
	},
	{
		ID: 900000008,
		slug: 'paperfoxprints.com',
		name: 'Paper Fox Prints',
		localUrl: 'http://localhost:8887',
		playgroundUrl: `${ PLAYGROUND_BLUEPRINT_BASE }/blueprint-paperfox.json`,
		previewImage: paperFoxPrintsPreview,
		tier: 'business',
		plan: BUSINESS_PLAN,
		isAtomic: true,
		subscribersCount: 87,
		storageUsedBytes: 41.8 * GB,
		maxStorageBytes: 50 * GB,
	},
	{
		ID: 900000009,
		slug: 'slow-mornings.com',
		name: 'Slow Mornings',
		localUrl: 'http://localhost:8888',
		playgroundUrl: `${ PLAYGROUND_BLUEPRINT_BASE }/blueprint-slowmornings.json`,
		previewImage: slowMorningsPreview,
		tier: 'premium',
		plan: PREMIUM_PLAN,
		subscribersCount: 156,
		storageUsedBytes: 4.2 * GB,
		maxStorageBytes: 13 * GB,
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
	MOCK_SITE_INPUTS.map( ( input ) => new window.URL( input.localUrl ).origin )
);

const PLAYGROUND_URL_BY_ORIGIN = new Map(
	MOCK_SITE_INPUTS.map( ( input ) => [
		new window.URL( input.localUrl ).origin,
		input.playgroundUrl,
	] )
);

const PREVIEW_IMAGE_BY_ORIGIN = new Map(
	MOCK_SITE_INPUTS.map( ( input ) => [
		new window.URL( input.localUrl ).origin,
		input.previewImage,
	] )
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

export function getMockBloggerSite( slug: string ): { site: Site; tier: BloggerTier } | undefined {
	const site = MOCK_SITE_BY_SLUG.get( slug );
	const input = MOCK_INPUT_BY_SLUG.get( slug );
	if ( ! site || ! input ) {
		return undefined;
	}
	return { site, tier: input.tier };
}

export function getMockBloggerStorage( slug: string ) {
	const input = MOCK_INPUT_BY_SLUG.get( slug );
	if ( ! input ) {
		return undefined;
	}
	return { usedBytes: input.storageUsedBytes, maxBytes: input.maxStorageBytes };
}

/**
 * Hydrates the mock sites with live data (title, tagline, icon) from their
 * Studio sites' REST APIs. Mutates the shared Site objects in place, then
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
					const response = await fetch( `${ input.localUrl }/wp-json/`, {
						signal: controller.signal,
					} );
					clearTimeout( timer );
					if ( ! response.ok ) {
						return;
					}
					const data: { name?: string; site_icon_url?: string } = await response.json();
					if ( data.name ) {
						site.name = data.name;
					}
					if ( data.site_icon_url ) {
						site.icon = { img: data.site_icon_url, ico: data.site_icon_url };
					}
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
	premium: 96,
	business: 300,
	commerce: 540,
};

function makeMockCurrentPlan( input: MockSiteInput ): SiteContextualPlan {
	const price = TIER_YEARLY_PRICE[ input.tier ];
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
		product_id: input.plan.product_id,
		product_slug: input.plan.product_slug,
		product_name: input.plan.product_name ?? input.plan.product_name_short,
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
	];
}

/**
 * Each mock site owns its free wpcom subdomain, like a real site would — this
 * feeds the /domains list and each site's Domains page (which filters the
 * account-level list by blog_id).
 */
export function getMockDomains(): DomainSummary[] {
	return MOCK_SITE_INPUTS.map( ( input ) => {
		return {
			domain: input.slug,
			subtype: { id: 'default_address', label: 'Default site address' },
			blog_id: input.ID,
			blog_name: input.name,
			site_slug: input.slug,
			auto_renewing: false,
			current_user_is_owner: true,
			is_domain_only_site: false,
			expiry: null,
			expired: false,
			primary_domain: true,
			can_set_as_primary: false,
			domain_status: { id: 'active', label: 'Active', type: 'success' },
			subscription_id: null,
			tags: [],
			wpcom_domain: true,
			type: 'wpcom',
			current_user_can_manage: true,
			has_registration: false,
		} as unknown as DomainSummary;
	} );
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
		hydrateMockBloggerSites().then( writeMockSiteCaches );
	} );
}
