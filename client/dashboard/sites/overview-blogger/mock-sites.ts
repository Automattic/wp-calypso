/**
 * Local-only prototype data. Injects three fake blogger/creator sites (Free,
 * Premium, Business) into the sites list so the blogger-focused overview
 * redesign can be explored at /sites/<slug> without real API data.
 */
import {
	getPersistQueryClientPromise,
	queryClient,
	siteByIdQuery,
	siteBySlugQuery,
	siteCurrentPlanQuery,
	siteMediaStorageQuery,
} from '@automattic/api-queries';
import type { Site, SiteContextualPlan } from '@automattic/api-core';

export type BloggerTier = 'free' | 'premium' | 'business';

const MB = 1024 * 1024;
const GB = 1024 * MB;

interface MockSiteInput {
	ID: number;
	slug: string;
	name: string;
	URL: string;
	tier: BloggerTier;
	plan: NonNullable< Site[ 'plan' ] >;
	isAtomic?: boolean;
	storageUsedBytes: number;
	maxStorageBytes: number;
	/** Only shown in the solo-blogger persona (?persona=blogger). */
	solo?: boolean;
}

// Local Studio site running the untangling-prototype mu-plugin, so the
// MSD → WP Admin round trip works end-to-end in the demo.
const LOCAL_WP_ADMIN_URL = 'http://localhost:8881/wp-admin/';

function makeMockSite( input: MockSiteInput ): Site {
	return {
		ID: input.ID,
		slug: input.slug,
		name: input.name,
		URL: input.URL,
		plan: input.plan,
		capabilities: {
			manage_options: true,
			update_plugins: true,
		},
		feed_ID: input.ID,
		feed_URL: `${ input.URL }/feed/`,
		subscribers_count: 0,
		options: {
			admin_url: LOCAL_WP_ADMIN_URL,
			created_at: '2025-09-14T10:00:00+00:00',
			updated_at: '2026-07-14T15:43:00+00:00',
			software_version: '7.0.1',
			site_intent: 'write',
			unmapped_url: input.URL,
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

const MOCK_SITE_INPUTS: MockSiteInput[] = [
	{
		ID: 900000001,
		slug: 'sunrise-stories.wordpress.com',
		name: 'Sunrise Stories',
		URL: 'https://sunrise-stories.wordpress.com',
		tier: 'free',
		plan: {
			product_id: 1,
			product_slug: 'free_plan',
			product_name: 'WordPress.com Free',
			product_name_short: 'Free',
			product_name_en: 'Free',
			expired: false,
			is_free: true,
			features: { active: [] },
		},
		storageUsedBytes: 118 * MB,
		maxStorageBytes: 1 * GB,
	},
	{
		ID: 900000002,
		slug: 'coastalshots.gallery',
		name: 'Coastal Shots',
		URL: 'https://coastalshots.gallery',
		tier: 'premium',
		plan: {
			product_id: 1003,
			product_slug: 'value_bundle',
			product_name: 'WordPress.com Premium',
			product_name_short: 'Premium',
			product_name_en: 'Premium',
			expired: false,
			is_free: false,
			billing_period: 'Yearly',
			features: { active: [] },
		},
		storageUsedBytes: 452 * MB,
		maxStorageBytes: 13 * GB,
	},
	{
		ID: 900000003,
		slug: 'lucastravels.com',
		name: 'Lucas Travels',
		URL: 'https://lucastravels.com',
		tier: 'business',
		plan: {
			product_id: 1008,
			product_slug: 'business-bundle',
			product_name: 'WordPress.com Business',
			product_name_short: 'Business',
			product_name_en: 'Business',
			expired: false,
			is_free: false,
			billing_period: 'Yearly',
			features: { active: [] },
		},
		isAtomic: true,
		storageUsedBytes: 4.6 * GB,
		maxStorageBytes: 50 * GB,
	},
	{
		ID: 900000004,
		slug: 'aperture-diaries.com',
		name: 'Aperture Diaries',
		URL: 'https://aperture-diaries.com',
		tier: 'premium',
		plan: {
			product_id: 1003,
			product_slug: 'value_bundle',
			product_name: 'WordPress.com Premium',
			product_name_short: 'Premium',
			product_name_en: 'Premium',
			expired: false,
			is_free: false,
			billing_period: 'Yearly',
			features: { active: [] },
		},
		storageUsedBytes: 12.2 * GB,
		maxStorageBytes: 13 * GB,
		solo: true,
	},
];

export const MOCK_BLOGGER_SITES: Site[] = MOCK_SITE_INPUTS.map( makeMockSite );

export const SOLO_BLOGGER_SITE_SLUG = 'aperture-diaries.com';

// Mock domains don't resolve, so the sites-list iframe preview renders
// blank. These theme screenshots stand in for it.
const MOCK_PREVIEW_THEME: Record< string, string > = {
	'sunrise-stories.wordpress.com': 'lettre',
	'coastalshots.gallery': 'dorna',
	'lucastravels.com': 'stewart',
	'aperture-diaries.com': 'dorna',
};

export function getMockSitePreviewImage( slug: string ): string | undefined {
	const theme = MOCK_PREVIEW_THEME[ slug ];
	return theme ? `https://s0.wp.com/wp-content/themes/pub/${ theme }/screenshot.png` : undefined;
}

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

const TIER_YEARLY_PRICE: Record< BloggerTier, number > = {
	free: 0,
	premium: 96,
	business: 300,
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

function getMockQueryKeys( input: MockSiteInput ) {
	return [
		siteBySlugQuery( input.slug ).queryKey,
		siteByIdQuery( input.ID ).queryKey,
		siteMediaStorageQuery( input.ID ).queryKey,
		siteCurrentPlanQuery( input.ID ).queryKey,
	];
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
	}

	getPersistQueryClientPromise().then( () => {
		for ( const input of MOCK_SITE_INPUTS ) {
			const site = MOCK_SITE_BY_SLUG.get( input.slug ) as Site;
			queryClient.setQueryData( siteBySlugQuery( input.slug ).queryKey, site );
			queryClient.setQueryData( siteByIdQuery( input.ID ).queryKey, site );
			queryClient.setQueryData( siteMediaStorageQuery( input.ID ).queryKey, {
				max_storage_bytes_from_add_ons: 0,
				max_storage_bytes: input.maxStorageBytes,
				storage_used_bytes: input.storageUsedBytes,
			} );
			queryClient.setQueryData(
				siteCurrentPlanQuery( input.ID ).queryKey,
				makeMockCurrentPlan( input )
			);
		}
	} );
}
