import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import iconCreator from 'calypso/assets/images/jetpack/jetpack-product-icon-creator.svg';
import iconScan from 'calypso/assets/images/jetpack/jetpack-product-icon-scan.svg';
import iconStats from 'calypso/assets/images/jetpack/jetpack-product-icon-stats.svg';

export type PlanKey = 'free' | 'personal' | 'premium' | 'business' | 'commerce';
export type FeatureAvailability = 'full' | 'limited' | 'addon' | 'none';

export interface Feature {
	id: string;
	name: string;
	description: string;
	plans: Record< PlanKey, FeatureAvailability >;
	notes?: Partial< Record< PlanKey, string > >;
	requiresWooCommerce?: boolean;
	path?: string; // Calypso path with :site placeholder, e.g. '/activity-log/:site'
}

export interface FeatureGroup {
	id: string;
	name: string;
	colorClass: 'blue' | 'purple' | 'green';
	iconSrc?: string;
	gridicon?: string;
	features: Feature[];
}

export const PLAN_KEY_ORDER: PlanKey[] = [ 'free', 'personal', 'premium', 'business', 'commerce' ];

export const PLAN_DISPLAY_NAMES: Record< PlanKey, string > = {
	free: 'Free',
	personal: 'Personal',
	premium: 'Premium',
	business: 'Business',
	commerce: 'Commerce',
};

export const PLAN_SLUGS: Record< PlanKey, string > = {
	free: PLAN_FREE,
	personal: PLAN_PERSONAL,
	premium: PLAN_PREMIUM,
	business: PLAN_BUSINESS,
	commerce: PLAN_ECOMMERCE,
};

const PLAN_TIER_MAP: Partial< Record< string, number > > = {
	[ PLAN_FREE ]: 0,
	[ PLAN_PERSONAL ]: 1,
	[ PLAN_PREMIUM ]: 2,
	[ PLAN_BUSINESS ]: 3,
	[ PLAN_ECOMMERCE ]: 4,
};

export function getPlanTier( productSlug: string | undefined | null ): number {
	if ( ! productSlug ) {
		return 0;
	}
	const baseSlug = productSlug.replace( /-(2y|3y|monthly)$/, '' );
	return PLAN_TIER_MAP[ baseSlug ] ?? 0;
}

export function getPlanKey( tier: number ): PlanKey {
	return PLAN_KEY_ORDER[ Math.min( Math.max( tier, 0 ), PLAN_KEY_ORDER.length - 1 ) ];
}

export function isFeatureActive( feature: Feature, planKey: PlanKey ): boolean {
	const availability = feature.plans[ planKey ];
	return availability === 'full' || availability === 'limited';
}

export function getFeaturesUnlockedAt( planKey: PlanKey, allGroups: FeatureGroup[] ): Feature[] {
	const tierIndex = PLAN_KEY_ORDER.indexOf( planKey );
	if ( tierIndex <= 0 ) {
		return [];
	}
	const previousKey = PLAN_KEY_ORDER[ tierIndex - 1 ];
	const unlocked: Feature[] = [];
	for ( const group of allGroups ) {
		for ( const feature of group.features ) {
			if ( feature.plans[ previousKey ] === 'none' && feature.plans[ planKey ] !== 'none' ) {
				unlocked.push( feature );
			}
		}
	}
	return unlocked;
}

export const FEATURE_GROUPS: FeatureGroup[] = [
	{
		id: 'protect',
		name: 'Protect',
		colorClass: 'blue',
		iconSrc: iconScan,
		features: [
			{
				id: 'brute-force',
				name: 'Brute force protection',
				description: 'Block login attacks automatically',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/brute-force',
			},
			{
				id: 'uptime-monitoring',
				name: 'Uptime monitoring',
				description: 'Alerts when your site goes down',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/uptime-monitoring',
			},
			{
				id: 'activity-log',
				name: 'Activity log',
				description: 'Audit trail of site changes',
				plans: {
					free: 'limited',
					personal: 'limited',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				notes: { free: 'Last 20 events', personal: 'Last 20 events' },
				path: '/jetpack-features/:site/activity-log', // interstitial
			},
			{
				id: 'malware-scanning',
				name: 'Malware scanning',
				description: 'Automated threat detection',
				plans: {
					free: 'none',
					personal: 'none',
					premium: 'limited',
					business: 'full',
					commerce: 'full',
				},
				notes: { premium: 'Manual scan only' },
				path: '/jetpack-features/:site/malware-scanning',
			},
			{
				id: 'automated-backups',
				name: 'Automated backups',
				description: 'Daily off-site backups',
				plans: {
					free: 'none',
					personal: 'none',
					premium: 'none',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/backups',
			},
			{
				id: 'waf',
				name: 'Web application firewall',
				description: 'Block malicious traffic',
				plans: {
					free: 'none',
					personal: 'none',
					premium: 'none',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/waf',
			},
		],
	},
	{
		id: 'create',
		name: 'Create',
		colorClass: 'blue',
		iconSrc: iconCreator,
		features: [
			{
				id: 'image-cdn',
				name: 'Image CDN',
				description: 'Serve optimised images globally',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/image-cdn',
			},
			{
				id: 'asset-cdn',
				name: 'Static asset CDN',
				description: 'Cache JS/CSS at the edge',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/asset-cdn',
			},
			{
				id: 'contact-form',
				name: 'Contact form',
				description: 'Simple drag-and-drop forms',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/contact-form',
			},
			{
				id: 'videopress',
				name: 'VideoPress',
				description: 'Ad-free video hosting',
				plans: {
					free: 'none',
					personal: 'limited',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				notes: { personal: '1 video, 1 GB storage' },
				path: '/jetpack-features/:site/videopress',
			},
		],
	},
	{
		id: 'grow',
		name: 'Grow',
		colorClass: 'purple',
		iconSrc: iconStats,
		features: [
			{
				id: 'site-stats',
				name: 'Site stats',
				description: 'Traffic, views and visitors',
				path: '/jetpack-features/:site/site-stats',
				plans: {
					free: 'limited',
					personal: 'limited',
					premium: 'limited',
					business: 'full',
					commerce: 'full',
				},
				notes: {
					free: 'Last 7 days only',
					personal: 'Last 30 days',
					premium: 'Last 30 days',
				},
			},
			{
				id: 'top-posts',
				name: 'Top posts widget',
				description: 'Surface your most popular content',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/top-posts',
			},
			{
				id: 'email-subscriptions',
				name: 'Email subscriptions',
				description: 'Readers subscribe to new posts',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/email-subscriptions',
			},
			{
				id: 'social-sharing',
				name: 'Social sharing buttons',
				description: 'Share on any network',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/social-sharing',
			},
			{
				id: 'related-posts',
				name: 'Related posts',
				description: 'Keep readers on your site',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/related-posts',
			},
			{
				id: 'social-auto-posting',
				name: 'Social auto-posting',
				description: 'Publish to social on post',
				plans: {
					free: 'none',
					personal: 'limited',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				notes: { personal: '1 social connection' },
				path: '/jetpack-features/:site/social',
			},
			{
				id: 'jetpack-search',
				name: 'Jetpack Search',
				description: 'Fast, relevant site search',
				plans: {
					free: 'none',
					personal: 'none',
					premium: 'none',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/search',
			},
			{
				id: 'seo-tools',
				name: 'SEO tools',
				description: 'Sitemaps, meta and structured data',
				plans: {
					free: 'none',
					personal: 'none',
					premium: 'none',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/seo',
			},
			{
				id: 'utm-tracking',
				name: 'Advanced referrers & UTM tracking',
				description: 'Detailed traffic source analysis',
				plans: {
					free: 'none',
					personal: 'none',
					premium: 'none',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/utm-tracking',
			},
			{
				id: 'crm',
				name: 'Jetpack CRM',
				description: 'Entrepreneur plan',
				plans: {
					free: 'none',
					personal: 'none',
					premium: 'none',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/crm',
			},
		],
	},
	{
		id: 'earn',
		name: 'Earn',
		colorClass: 'green',
		gridicon: 'money',
		features: [
			{
				id: 'donations',
				name: 'Donation buttons',
				description: 'Accept one-time donations',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/donations',
			},
			{
				id: 'recurring-payments',
				name: 'Recurring payments',
				description: 'Sell subscriptions and memberships',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/recurring-payments',
			},
			{
				id: 'paid-content',
				name: 'Paid content gating',
				description: 'Members-only posts and pages',
				plans: {
					free: 'full',
					personal: 'full',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				path: '/jetpack-features/:site/paid-content',
			},
			{
				id: 'woo-analytics',
				name: 'WooCommerce analytics',
				description: 'Revenue, orders and customer insights',
				plans: {
					free: 'none',
					personal: 'none',
					premium: 'none',
					business: 'full',
					commerce: 'full',
				},
				requiresWooCommerce: true,
				path: '/jetpack-features/:site/woo-analytics',
			},
		],
	},
];

export function getFeatureById( id: string ): Feature | undefined {
	for ( const group of FEATURE_GROUPS ) {
		const found = group.features.find( ( f ) => f.id === id );
		if ( found ) {
			return found;
		}
	}
	return undefined;
}

export function getFeatureGroup( id: string ): FeatureGroup | undefined {
	return FEATURE_GROUPS.find( ( g ) => g.features.some( ( f ) => f.id === id ) );
}
