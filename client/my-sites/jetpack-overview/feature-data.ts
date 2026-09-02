import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
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
	free: translate( 'Free' ),
	personal: translate( 'Personal' ),
	premium: translate( 'Premium' ),
	business: translate( 'Business' ),
	commerce: translate( 'Commerce' ),
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
		name: translate( 'Protect' ),
		colorClass: 'blue',
		iconSrc: iconScan,
		features: [
			{
				id: 'brute-force',
				name: translate( 'Brute force protection' ),
				description: translate( 'Block login attacks automatically' ),
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
				name: translate( 'Uptime monitoring' ),
				description: translate( 'Alerts when your site goes down' ),
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
				name: translate( 'Activity log' ),
				description: translate( 'Audit trail of site changes' ),
				plans: {
					free: 'limited',
					personal: 'limited',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				notes: { free: translate( 'Last 20 events' ), personal: translate( 'Last 20 events' ) },
				path: '/jetpack-features/:site/activity-log', // interstitial
			},
			{
				id: 'malware-scanning',
				name: translate( 'Malware scanning' ),
				description: translate( 'Automated threat detection' ),
				plans: {
					free: 'none',
					personal: 'none',
					premium: 'limited',
					business: 'full',
					commerce: 'full',
				},
				notes: { premium: translate( 'Manual scan only' ) },
				path: '/jetpack-features/:site/malware-scanning',
			},
			{
				id: 'automated-backups',
				name: translate( 'Automated backups' ),
				description: translate( 'Daily off-site backups' ),
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
				name: translate( 'Web application firewall' ),
				description: translate( 'Block malicious traffic' ),
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
		name: translate( 'Create' ),
		colorClass: 'blue',
		iconSrc: iconCreator,
		features: [
			{
				id: 'image-cdn',
				name: translate( 'Image CDN' ),
				description: translate( 'Serve optimised images globally' ),
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
				name: translate( 'Static asset CDN' ),
				description: translate( 'Cache JS/CSS at the edge' ),
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
				name: translate( 'Contact form' ),
				description: translate( 'Simple drag-and-drop forms' ),
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
				name: translate( 'VideoPress' ),
				description: translate( 'Ad-free video hosting' ),
				plans: {
					free: 'none',
					personal: 'limited',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				notes: { personal: translate( '1 video, 1 GB storage' ) },
				path: '/jetpack-features/:site/videopress',
			},
		],
	},
	{
		id: 'grow',
		name: translate( 'Grow' ),
		colorClass: 'purple',
		iconSrc: iconStats,
		features: [
			{
				id: 'site-stats',
				name: translate( 'Site stats' ),
				description: translate( 'Traffic, views and visitors' ),
				path: '/jetpack-features/:site/site-stats',
				plans: {
					free: 'limited',
					personal: 'limited',
					premium: 'limited',
					business: 'full',
					commerce: 'full',
				},
				notes: {
					free: translate( 'Last 7 days only' ),
					personal: translate( 'Last 30 days' ),
					premium: translate( 'Last 30 days' ),
				},
			},
			{
				id: 'top-posts',
				name: translate( 'Top posts widget' ),
				description: translate( 'Surface your most popular content' ),
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
				name: translate( 'Email subscriptions' ),
				description: translate( 'Readers subscribe to new posts' ),
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
				name: translate( 'Social sharing buttons' ),
				description: translate( 'Share on any network' ),
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
				name: translate( 'Related posts' ),
				description: translate( 'Keep readers on your site' ),
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
				name: translate( 'Social auto-posting' ),
				description: translate( 'Publish to social on post' ),
				plans: {
					free: 'none',
					personal: 'limited',
					premium: 'full',
					business: 'full',
					commerce: 'full',
				},
				notes: { personal: translate( '1 social connection' ) },
				path: '/jetpack-features/:site/social',
			},
			{
				id: 'jetpack-search',
				name: translate( 'Jetpack Search' ),
				description: translate( 'Fast, relevant site search' ),
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
				name: translate( 'SEO tools' ),
				description: translate( 'Sitemaps, meta and structured data' ),
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
				name: translate( 'Advanced referrers & UTM tracking' ),
				description: translate( 'Detailed traffic source analysis' ),
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
				name: translate( 'Jetpack CRM' ),
				description: translate( 'Entrepreneur plan' ),
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
		name: translate( 'Earn' ),
		colorClass: 'green',
		gridicon: 'money',
		features: [
			{
				id: 'donations',
				name: translate( 'Donation buttons' ),
				description: translate( 'Accept one-time donations' ),
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
				name: translate( 'Recurring payments' ),
				description: translate( 'Sell subscriptions and memberships' ),
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
				name: translate( 'Paid content gating' ),
				description: translate( 'Members-only posts and pages' ),
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
				name: translate( 'WooCommerce analytics' ),
				description: translate( 'Revenue, orders and customer insights' ),
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
