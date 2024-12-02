import {
	isJetpackAntiSpamSlug,
	isJetpackBackupT1Slug,
	isJetpackBoostSlug,
	isJetpackCompleteSlug,
	isJetpackGrowthPlan,
	isJetpackScanSlug,
	isJetpackSearchSlug,
	isJetpackSecurityT1Slug,
	isJetpackSocialBasicSlug,
	isJetpackSocialAdvancedSlug,
	isJetpackSocialV1Slug,
	isJetpackStatsFreeProductSlug,
	isJetpackStatsPaidProductSlug,
	isJetpackVideoPressSlug,
	isJetpackAISlug,
	isJetpackCreatorSlug,
	PRODUCT_JETPACK_CREATOR_MONTHLY,
	isJetpackStatsPaidTieredProductSlug,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { createElement } from 'react';
import type { WithSnakeCaseSlug } from '@automattic/calypso-products';
import type { ReactElement } from 'react';

type featureString =
	| 'ai'
	| 'anti-spam'
	| 'backup-t1'
	| 'boost'
	| 'growth'
	| 'scan'
	| 'search'
	| 'social-basic'
	| 'social-advanced'
	| 'social-v1'
	| 'stats-free'
	| 'stats'
	| 'support'
	| 'videopress'
	| 'creator'
	| 'creator-promo'
	| 'complete'
	| 'support-if-eligible';

function getFeatureStrings(
	feature: featureString,
	translate: ReturnType< typeof useTranslate >
): ( ReactElement | number | string )[] {
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
				translate( 'Automated critical CSS generation' ),
				translate( 'Faster server response with Page Cache' ),
				translate( 'Reduce image sizes with Image Guide' ),
				translate( 'Historical site performance chart' ),
				translate( 'Additional image quality control options' ),
				translate( 'Priority support' ),
				translate( 'Site performance scores' ),
				translate( 'One-click optimization' ),
				translate( 'Deferred non-essential JavaScript' ),
				translate( 'Optimized CSS loading' ),
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
				translate( 'Stats (Up to 100K site views, upgradeable)' ),
			];
		case 'growth':
			// JetPack Creator features
			return [
				translate( 'Stats (10K site views, upgradeable)' ),
				translate( 'Social' ),
				translate( 'Display ads with WordAds' ),
				translate( 'Pay with PayPal' ),
				translate( 'Import unlimited subscribers' ),
				translate( '40+ Jetpack blocks' ),
				translate( 'Paid content gating' ),
				translate( 'Paywall access' ),
				translate( 'Newsletter' ),
				translate( 'Priority support' ),
				translate( '2% transaction fees' ),
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
		case 'social-v1':
			return [
				translate( 'Engagement Optimizer' ),
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
			return [ translate( 'Instant access to upcoming features' ), translate( 'UTM Tracking' ) ];
		case 'support':
			return [ translate( 'Priority support' ) ];
		case 'support-if-eligible':
			return [ translate( 'Priority support if eligible' ) ];
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
		case 'creator':
			return [
				translate( 'Display ads with WordAds' ),
				translate( 'Pay with PayPal' ),
				translate( 'Import unlimited subscribers' ),
				translate( '40+ Jetpack blocks' ),
				translate( 'Paid content gating' ),
				translate( 'Paywall access' ),
				translate( 'Newsletter' ),
				translate( 'Priority support' ),
				translate( '2% transaction fees' ),
			];
		case 'creator-promo': {
			return [
				/* translators: Blaze is a product name and should not be translated.
					{{strong}} is a React component that renders a <strong> tag.
					%(credits)s is a placeholder for the number of credits.
					The Blaze promo is only available from Nov 6 - 12, 2023.
				*/
				translate( '{{strong}}$%(credits)s free Blaze advertising credits{{/strong}}', {
					components: {
						strong: createElement( 'strong' ),
					},
					args: {
						// Nov 6 - 8, 2023: $500 free Blaze advertising credits
						// Nov 9 - 12, 2023: $150 free Blaze advertising credits
						credits: Date.now() < Date.UTC( 2023, 10, 9 ) ? '500' : '150',
					},
				} ),
			];
		}
		default:
			return [];
	}
}

export default function getJetpackProductFeatures(
	product: WithSnakeCaseSlug,
	translate: ReturnType< typeof useTranslate >
): ( ReactElement | number | string )[] {
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

	if ( isJetpackGrowthPlan( product.product_slug ) ) {
		return [
			...getFeatureStrings( 'growth', translate ),
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
			return ! securityExcludes.includes( productFeature.toString() );
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

	if ( isJetpackSocialV1Slug( product.product_slug ) ) {
		return [ ...getFeatureStrings( 'social-v1', translate ) ];
	}

	if ( isJetpackStatsFreeProductSlug( product.product_slug ) ) {
		return [ ...getFeatureStrings( 'stats-free', translate ) ];
	}

	/** Stats PWYW has the same feature set with Stats Free, only with support when paying above certain amount */
	if (
		isJetpackStatsPaidProductSlug( product.product_slug ) &&
		! isJetpackStatsPaidTieredProductSlug( product.product_slug )
	) {
		return [
			...getFeatureStrings( 'stats-free', translate ),
			...getFeatureStrings( 'support-if-eligible', translate ),
		];
	}

	if ( isJetpackStatsPaidTieredProductSlug( product.product_slug ) ) {
		return [
			...getFeatureStrings( 'stats-free', translate ),
			...getFeatureStrings( 'stats', translate ),
			...getFeatureStrings( 'support', translate ),
		];
	}

	if ( isJetpackVideoPressSlug( product.product_slug ) ) {
		return getFeatureStrings( 'videopress', translate );
	}

	if ( isJetpackCreatorSlug( product.product_slug ) ) {
		// Blaze launch promo: Nov 6 - Nov 12, 2023, only for annual plans
		const blazePromo =
			Date.now() > Date.UTC( 2023, 10, 6 ) &&
			Date.now() < Date.UTC( 2023, 10, 13 ) &&
			product.product_slug !== PRODUCT_JETPACK_CREATOR_MONTHLY
				? getFeatureStrings( 'creator-promo', translate )
				: [];
		return [ ...blazePromo, ...getFeatureStrings( 'creator', translate ) ];
	}

	return [];
}
