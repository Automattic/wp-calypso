import {
	isJetpackBackupT1Slug,
	isJetpackScanSlug,
	isJetpackSearchSlug,
	isJetpackSocialBasicSlug,
	isJetpackSocialAdvancedSlug,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import type { WithSnakeCaseSlug } from '@automattic/calypso-products';

export default function getJetpackProductFeatures(
	product: WithSnakeCaseSlug,
	translate: ReturnType< typeof useTranslate >
): string[] {
	const productFeatureStrings = {
		backupT1: [
			translate( 'Real-time cloud backups' ),
			translate( '10GB of backup storage' ),
			translate( '30-day archive & activity log' ),
			translate( 'One-click restores' ),
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
			translate( 'Post to multiple channels at once' ),
			translate( 'Schedule your posts' ),
			translate( 'Share to Twitter, Facebook, LinkedIn, and Tumblr' ),
			translate( 'Recycle content' ),
		],
		socialAdvanced: [ translate( 'Engagement Optimizer' ) ],
		support: [ translate( 'Priority support' ) ],
	};

	if ( isJetpackBackupT1Slug( product.product_slug ) ) {
		return [ ...productFeatureStrings.backupT1, ...productFeatureStrings.support ];
	}

	if ( isJetpackScanSlug( product.product_slug ) ) {
		return [ ...productFeatureStrings.scan, ...productFeatureStrings.support ];
	}

	if ( isJetpackSearchSlug( product.product_slug ) ) {
		return productFeatureStrings.search;
	}

	if ( isJetpackSocialBasicSlug( product.product_slug ) ) {
		return productFeatureStrings.socialBasic;
	}

	if ( isJetpackSocialAdvancedSlug( product.product_slug ) ) {
		return [ ...productFeatureStrings.socialBasic, ...productFeatureStrings.socialAdvanced ];
	}

	return [];
}
