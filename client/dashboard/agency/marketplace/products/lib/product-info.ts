import { __ } from '@wordpress/i18n';
import type { AgencyProduct } from '@automattic/api-core';

interface ProductInfo {
	benefits: string[];
	recommendedFor: string[];
	/** Store slugs of the products a plan bundles, used to match searches. */
	includes?: string[];
}

// Copied from the Jetpack catalog the classic dashboard reads through
// calypso-products, which the dashboard must not import. Keyed by the agency
// product slug; the products API carries only names and prices.
const getProductInfoMap = (): Record< string, ProductInfo > => ( {
	'jetpack-ai': {
		benefits: [
			__( 'Harness AI power directly from your editor' ),
			__( 'Unlock high-quality, tailored content at your command' ),
			__( 'Maintain professional standards with ease' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [
			__( 'Bloggers' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
			__( 'Online forums' ),
			__( 'WooCommerce stores' ),
		],
	},
	'jetpack-anti-spam': {
		benefits: [
			__( 'Set up in minutes without a developer' ),
			__( 'Save time manually reviewing spam' ),
			__( 'Increase engagement by removing CAPTCHAs' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [
			__( 'Blogs' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
			__( 'Online forums' ),
			__( 'WooCommerce stores' ),
		],
	},
	'jetpack-backup-t1': {
		benefits: [
			__( 'Protect your revenue stream and content' ),
			__( 'Restore your site in one click from desktop or mobile' ),
			__( 'Restore or clone offline sites' ),
			__( 'Fix your site without a developer' ),
			__( 'Protect Woo order and customer data' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [
			__( 'WooCommerce stores' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
			__( 'Online forums' ),
		],
	},
	'jetpack-backup-t2': {
		benefits: [
			__( 'Protect your revenue stream and content' ),
			__( 'Restore your site in one click from desktop or mobile' ),
			__( 'Restore or clone offline sites' ),
			__( 'Fix your site without a developer' ),
			__( 'Protect Woo order and customer data' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [
			__( 'WooCommerce stores' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
			__( 'Online forums' ),
		],
	},
	'jetpack-boost': {
		benefits: [
			__( 'Quickly test and improve your site speed' ),
			__( 'Improve your site’s SEO' ),
			__( 'Get faster FCP and LCP' ),
			__( 'No developer required' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [ __( 'All sites' ) ],
	},
	'jetpack-complete': {
		benefits: [
			__( 'Protect your revenue stream and content' ),
			__( 'Learn about issues before your customers are impacted' ),
			__( 'Restore your site in one click from desktop or mobile' ),
			__( 'Fix your site without a developer' ),
			__( 'Protect Woo order and customer data' ),
			__( 'Save time manually reviewing spam' ),
			__( 'Grow your business with video, social, and CRM tools' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [
			__( 'WooCommerce stores' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
		],
		includes: [
			'jetpack_backup_t2_yearly',
			'jetpack_scan',
			'jetpack_anti_spam',
			'jetpack_videopress',
			'jetpack_boost_yearly',
			'jetpack_social_advanced_yearly',
			'jetpack_search',
			'jetpack_stats_yearly',
			'jetpack_ai_yearly',
			'jetpack_crm',
		],
	},
	'jetpack-creator': {
		benefits: [
			__( 'Quickly create content that stands out' ),
			__( 'Grow your subscribers with simple subscribe forms' ),
			__( 'Create content for paid subscribers' ),
			__( 'Sell access to premium content' ),
			__( 'Easily accept tips and donations' ),
		],
		recommendedFor: [
			__( 'Educators' ),
			__( 'Bloggers' ),
			__( 'Videographers' ),
			__( 'Membership sites' ),
		],
	},
	'jetpack-growth': {
		benefits: [
			__( 'Quickly create content that stands out' ),
			__( 'Grow your subscribers with simple subscribe forms' ),
			__( 'Create content for paid subscribers' ),
			__( 'Sell access to premium content' ),
			__( 'Easily accept tips and donations' ),
		],
		recommendedFor: [ __( 'WooCommerce Stores' ), __( 'Membership sites' ), __( 'Bloggers' ) ],
		includes: [ 'jetpack_stats_yearly', 'jetpack_social_v1_yearly' ],
	},
	'jetpack-monitor': {
		benefits: [
			__(
				'Rapid detection: With our 1-minute interval monitoring, we detect potential issues faster than ever before.'
			),
			__(
				'Multi-channel alerts: Get notified immediately when a site that you manage is down via SMS and email (multiple recipients).'
			),
			__(
				'Enhanced uptime: Experience less downtime and increased service reliability through prompt response and resolution.'
			),
			__( 'Reduce potential revenue losses because your site went down.' ),
		],
		recommendedFor: [],
	},
	'jetpack-scan': {
		benefits: [
			__( 'Protect your revenue stream and content' ),
			__( 'Learn about issues before your customers are impacted' ),
			__( 'Fix most issues in one click from desktop or mobile' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [
			__( 'WooCommerce stores' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
			__( 'Online forums' ),
		],
	},
	'jetpack-search': {
		benefits: [
			__( 'Customizable to fit your site’s design' ),
			__( 'Increase conversion with accurate search results' ),
			__( 'Tiered pricing - pay for only what you need' ),
			__( 'No developer required' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [
			__( 'WooCommerce stores' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
			__( 'Online forums' ),
		],
	},
	'jetpack-security-t1': {
		benefits: [
			__( 'Protect your revenue stream and content' ),
			__( 'Learn about issues before your customers are impacted' ),
			__( 'Restore your site in one click from desktop or mobile' ),
			__( 'Fix your site without a developer' ),
			__( 'Protect Woo order and customer data' ),
			__( 'Save time manually reviewing spam' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [
			__( 'WooCommerce stores' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
		],
		includes: [ 'jetpack_backup_t1_yearly', 'jetpack_scan', 'jetpack_anti_spam' ],
	},
	'jetpack-security-t2': {
		benefits: [
			__( 'Protect your revenue stream and content' ),
			__( 'Learn about issues before your customers are impacted' ),
			__( 'Restore your site in one click from desktop or mobile' ),
			__( 'Fix your site without a developer' ),
			__( 'Protect Woo order and customer data' ),
			__( 'Save time manually reviewing spam' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [
			__( 'WooCommerce stores' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
		],
		includes: [ 'jetpack_backup_t2_yearly', 'jetpack_scan', 'jetpack_anti_spam' ],
	},
	'jetpack-social-advanced': {
		benefits: [
			__( 'Save time by sharing your posts automatically' ),
			__( 'Unlock your growth potential by building a following on social media' ),
			__( 'Easy-to-use interface' ),
			__( 'No developer required' ),
			__( 'Enhance social media engagement with personalized posts' ),
			__( 'Upload & automatically share images and videos to social media' ),
			__( 'Automatically create custom images, saving you hours of tedious work' ),
			__( 'Repurpose, reuse or republish already published content' ),
		],
		recommendedFor: [
			__( 'Bloggers' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
			__( 'Online forums' ),
			__( 'WooCommerce stores' ),
		],
	},
	'jetpack-social-basic': {
		benefits: [
			__( 'Save time by sharing your posts automatically' ),
			__( 'Unlock your growth potential by building a following on social media' ),
			__( 'Easy-to-use interface' ),
			__( 'No developer required' ),
			__( 'Repurpose, reuse or republish already published content' ),
		],
		recommendedFor: [
			__( 'Bloggers' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
			__( 'Online forums' ),
			__( 'WooCommerce stores' ),
		],
	},
	'jetpack-social-v1': {
		benefits: [
			__( 'Save time by sharing your posts automatically' ),
			__( 'Unlock your growth potential by building a following on social media' ),
			__( 'Easy-to-use interface' ),
			__( 'No developer required' ),
			__( 'Enhance social media engagement with personalized posts' ),
			__( 'Upload & automatically share images and videos to social media' ),
			__( 'Automatically create custom images, saving you hours of tedious work' ),
			__( 'Repurpose, reuse or republish already published content' ),
		],
		recommendedFor: [
			__( 'Bloggers' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
			__( 'Online forums' ),
			__( 'WooCommerce stores' ),
		],
	},
	'jetpack-starter': {
		benefits: [
			__( 'Protect your revenue stream and content' ),
			__( 'Restore your site in one click from desktop or mobile' ),
			__( 'Fix your site without a developer' ),
			__( 'Protect Woo order and customer data' ),
			__( 'Save time manually reviewing spam' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [ __( 'Small sites' ), __( 'Blogs' ) ],
		includes: [ 'jetpack_backup_t0_yearly', 'jetpack_anti_spam' ],
	},
	'jetpack-stats': {
		benefits: [
			__( 'Better understand your audience' ),
			__( 'Discover your top performing posts & pages' ),
			__( 'Get detailed insights on the referrers that bring traffic from your site' ),
			__( 'See what countries your visitors are coming from' ),
			__( 'Find who is creating the most popular content on your team with our author metrics' ),
			__( 'View weekly and yearly trends with 7-day Highlights and Year in Review' ),
			__( 'UTM tracking' ),
			__( 'Traffic spike forgiveness' ),
			__( 'Overage forgiveness' ),
			__( 'Commercial use' ),
		],
		recommendedFor: [
			__( 'WooCommerce stores' ),
			__( 'News organizations' ),
			__( 'Membership sites' ),
		],
	},
	'jetpack-videopress': {
		benefits: [
			__( 'Increase engagement and get your message across' ),
			__( 'Drag and drop videos through the WordPress editor' ),
			__( 'Manage videos in the WordPress media library' ),
			__( 'Remove distracting ads' ),
			__( 'Customizable colors to fit your brand and site' ),
			__( 'Best-in-class support from WordPress experts' ),
		],
		recommendedFor: [
			__( 'WooCommerce stores' ),
			__( 'Videographers' ),
			__( 'Educators' ),
			__( 'Blogs' ),
		],
	},
} );

export function getProductBenefits( product: AgencyProduct ): string[] {
	return getProductInfoMap()[ product.slug ]?.benefits ?? [];
}

export function getProductRecommendedFor( product: AgencyProduct ): string[] {
	return getProductInfoMap()[ product.slug ]?.recommendedFor ?? [];
}

export function getPlanIncludedProducts( slug: string ): string[] {
	return getProductInfoMap()[ slug ]?.includes ?? [];
}
