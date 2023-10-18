import {
	isJetpackAntiSpamSlug,
	isJetpackBackupT1Slug,
	isJetpackBoostSlug,
	isJetpackCompleteSlug,
	isJetpackScanSlug,
	isJetpackSearchSlug,
	isJetpackSecurityT1Slug,
	isJetpackSocialBasicSlug,
	isJetpackSocialAdvancedSlug,
	isJetpackStatsFreeProductSlug,
	isJetpackStatsPaidProductSlug,
	isJetpackVideoPressSlug,
	isJetpackAISlug,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import type { WithSnakeCaseSlug } from '@automattic/calypso-products';

type featureString =
	| 'ai'
	| 'anti-spam'
	| 'backup-t1'
	| 'boost'
	| 'scan'
	| 'search'
	| 'social-basic'
	| 'social-advanced'
	| 'stats-free'
	| 'stats'
	| 'support'
	| 'videopress'
	| 'complete';

function getFeatureStrings(
	feature: featureString,
	translate: ReturnType< typeof useTranslate >
): string[] {
	switch ( feature ) {
		case 'ai':
			return [
				translate( 'Prompt-based content generation' ),
				translate( 'Adaptive tone adjustment' ),
				translate( 'Superior spelling and grammar correction' ),
				translate( 'Title and summary generation' ),
			];
		case 'anti-spam':
			return [
				translate( 'Comment and form spam protection' ),
				translate( '10K API calls per month' ),
				translate( 'Akismet technology' ),
				translate( 'Flexible API' ),
			];
		case 'backup-t1':
			return [
				translate( 'Real-time cloud backups' ),
				translate( '10GB of backup storage' ),
				translate( '30-day archive & activity log' ),
				translate( 'One-click restores' ),
			];
		case 'boost':
			return [
				translate( 'Automated critical CSS generation (Premium)' ),
				translate( 'Reduce image sizes with image guide (Premium)' ),
				translate( 'Historical site performance chart (Premium)' ),
				translate( 'Additional image quality control options (Premium)' ),
				translate( 'Priority support (Premium)' ),
				translate( 'Site performance scores' ),
				translate( 'One-click optimization' ),
				translate( 'Deferred non-essential JavaScript' ),
				translate( 'Optimized CSS loading' ),
				translate( 'Lazy image loading' ),
				translate( 'CDN for images' ),
			];
		case 'complete':
			return [
				translate( 'Akismet Anti-spam' ),
				translate( 'VaultPress Backup' ),
				translate( 'Site Search' ),
				translate( 'Social' ),
				translate( 'Scan' ),
				translate( 'VideoPress' ),
				translate( 'Boost' ),
				translate( 'CRM Entrepreneur' ),
			];
		case 'scan':
			return [
				translate( 'Website firewall (WAF beta)' ),
				translate( 'Automated daily scanning' ),
				translate( 'One-click fixes for most issues' ),
				translate( 'Instant email threat notifications' ),
			];
		case 'search':
			return [
				translate( 'Instant search, filtering, and indexing' ),
				translate( 'Highly relevant search results' ),
				translate( 'Quick and accurate spelling correction' ),
				translate( 'Support for 38 languages' ),
			];
		case 'social-advanced':
			return [ translate( 'Engagement Optimizer' ) ];
		case 'social-basic':
			return [
				translate( 'Automatically share your posts' ),
				translate( 'Posting to multiple channels at once' ),
				translate( 'Scheduled posts' ),
				translate( 'Sharing to Facebook, LinkedIn, and Tumblr' ),
				translate( 'Content recycling' ),
			];
		case 'stats-free':
			return [
				translate( 'Real-time data on visitors, likes, and comments' ),
				translate( 'View weekly and yearly trends' ),
			];
		case 'stats':
			return [
				translate( 'Instant access to upcoming features' ),
				translate( 'Ad-free experience' ),
			];
		case 'support':
			return [ translate( 'Priority support' ) ];
		case 'videopress':
			return [
				translate( '1TB of cloud-hosted video' ),
				translate( 'Customizable video player' ),
				translate( 'Fast-motion video' ),
				translate( 'Global CDN' ),
				translate( 'Powerful and reliable hosting infrastructure' ),
				translate( 'Video and story blocks' ),
				translate( 'Unlimited logins for team members' ),
			];
		default:
			return [];
	}
}

export default function getJetpackProductFeatures(
	product: WithSnakeCaseSlug,
	translate: ReturnType< typeof useTranslate >
): string[] {
	if ( isJetpackAISlug( product.product_slug ) ) {
		return getFeatureStrings( 'ai', translate );
	}

	if ( isJetpackAntiSpamSlug( product.product_slug ) ) {
		return getFeatureStrings( 'anti-spam', translate );
	}

	if ( isJetpackBackupT1Slug( product.product_slug ) ) {
		return [
			...getFeatureStrings( 'backup-t1', translate ),
			...getFeatureStrings( 'support', translate ),
		];
	}

	if ( isJetpackBoostSlug( product.product_slug ) ) {
		return getFeatureStrings( 'boost', translate );
	}

	if ( isJetpackCompleteSlug( product.product_slug ) ) {
		return [
			...getFeatureStrings( 'complete', translate ),
			...getFeatureStrings( 'support', translate ),
		];
	}

	if ( isJetpackScanSlug( product.product_slug ) ) {
		return [
			...getFeatureStrings( 'scan', translate ),
			...getFeatureStrings( 'support', translate ),
		];
	}

	if ( isJetpackSearchSlug( product.product_slug ) ) {
		return getFeatureStrings( 'search', translate );
	}

	if ( isJetpackSecurityT1Slug( product.product_slug ) ) {
		// Filter out these strings for Security to avoid clutter
		const securityExcludes = [
			translate( '10K API calls per month' ),
			translate( 'Akismet technology' ),
			translate( 'Flexible API' ),
		];

		return [
			...getFeatureStrings( 'anti-spam', translate ),
			...getFeatureStrings( 'backup-t1', translate ),
			...getFeatureStrings( 'scan', translate ),
			...getFeatureStrings( 'support', translate ),
		].filter( ( productFeature ) => {
			return ! securityExcludes.includes( productFeature );
		} );
	}

	if ( isJetpackSocialBasicSlug( product.product_slug ) ) {
		return getFeatureStrings( 'social-basic', translate );
	}

	if ( isJetpackSocialAdvancedSlug( product.product_slug ) ) {
		return [
			...getFeatureStrings( 'social-basic', translate ),
			...getFeatureStrings( 'social-advanced', translate ),
		];
	}

	if ( isJetpackStatsFreeProductSlug( product.product_slug ) ) {
		return [ ...getFeatureStrings( 'stats-free', translate ) ];
	}

	if ( isJetpackStatsPaidProductSlug( product.product_slug ) ) {
		return [
			...getFeatureStrings( 'stats-free', translate ),
			...getFeatureStrings( 'stats', translate ),
			...getFeatureStrings( 'support', translate ),
		];
	}

	if ( isJetpackVideoPressSlug( product.product_slug ) ) {
		return getFeatureStrings( 'videopress', translate );
	}

	return [];
}
