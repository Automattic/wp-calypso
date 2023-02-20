import {
	isJetpackAntiSpamSlug,
	isJetpackBackupT1Slug,
	isJetpackBoostSlug,
	isJetpackScanSlug,
	isJetpackSearchSlug,
	isJetpackSecuritySlug,
	isJetpackSocialBasicSlug,
	isJetpackSocialAdvancedSlug,
	isJetpackVideoPressSlug,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import type { WithSnakeCaseSlug } from '@automattic/calypso-products';

export default function getJetpackProductFeatures(
	product: WithSnakeCaseSlug,
	translate: ReturnType< typeof useTranslate >
): string[] {
	const productFeatureStrings = {
		antiSpam: [
			translate( 'Comment and form spam protection' ),
			translate( '10K API calls per month' ),
			translate( 'Akismet technology' ),
			translate( 'Flexible API' ),
		],
		backupT1: [
			translate( 'Real-time cloud backups' ),
			translate( '10GB of backup storage' ),
			translate( '30-day archive & activity log' ),
			translate( 'One-click restores' ),
		],
		boost: [
			translate( 'Automated critical CSS' ),
			translate( 'Site performance scores' ),
			translate( 'One-click optimization' ),
			translate( 'Deferred non-essential JavaScript' ),
			translate( 'Optimized CSS loading' ),
			translate( 'Lazy image loading' ),
		],
		scan: [
			translate( 'Website firewall (WAF beta)' ),
			translate( 'Automated daily scanning' ),
			translate( 'One-click fixes for most issues' ),
			translate( 'Instant email threat notifications' ),
		],
		search: [
			translate( 'Instant search, filtering, and indexing' ),
			translate( 'Highly relevant search results' ),
			translate( 'Quick and accurate spelling correction' ),
			translate( 'Support for 38 languages' ),
		],
		socialBasic: [
			translate( 'Automatically share your posts' ),
			translate( 'Posting to multiple channels at once' ),
			translate( 'Scheduled posts' ),
			translate( 'Sharing to Twitter, Facebook, LinkedIn, and Tumblr' ),
			translate( 'Content recycling' ),
		],
		socialAdvanced: [ translate( 'Engagement Optimizer' ) ],
		support: [ translate( 'Priority support' ) ],
		videopress: [
			translate( '1TB of cloud-hosted video' ),
			translate( 'Customizable video player' ),
			translate( 'Fast-motion video' ),
			translate( 'Global CDN' ),
			translate( 'Powerful and reliable hosting infrastructure' ),
			translate( 'Video and story blocks' ),
			translate( 'Unlimited logins for team members' ),
		],
	};

	if ( isJetpackAntiSpamSlug( product.product_slug ) ) {
		return productFeatureStrings.antiSpam;
	}

	if ( isJetpackBackupT1Slug( product.product_slug ) ) {
		return [ ...productFeatureStrings.backupT1, ...productFeatureStrings.support ];
	}

	if ( isJetpackBoostSlug( product.product_slug ) ) {
		return productFeatureStrings.boost;
	}

	if ( isJetpackScanSlug( product.product_slug ) ) {
		return [ ...productFeatureStrings.scan, ...productFeatureStrings.support ];
	}

	if ( isJetpackSearchSlug( product.product_slug ) ) {
		return productFeatureStrings.search;
	}

	if ( isJetpackSecuritySlug( product.product_slug ) ) {
		return [
			...productFeatureStrings.antiSpam,
			...productFeatureStrings.backupT1,
			...productFeatureStrings.scan,
			...productFeatureStrings.support,
		];
	}

	if ( isJetpackSocialBasicSlug( product.product_slug ) ) {
		return productFeatureStrings.socialBasic;
	}

	if ( isJetpackSocialAdvancedSlug( product.product_slug ) ) {
		return [ ...productFeatureStrings.socialBasic, ...productFeatureStrings.socialAdvanced ];
	}

	if ( isJetpackVideoPressSlug( product.product_slug ) ) {
		return productFeatureStrings.videopress;
	}

	return [];
}
