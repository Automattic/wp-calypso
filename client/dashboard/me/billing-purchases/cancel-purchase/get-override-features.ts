import { __ } from '@wordpress/i18n';
import { getProductCategory } from './get-confirmation-copy';
import type { PurchaseForCopy } from './get-confirmation-copy';
import type { CancellationFeature } from '@automattic/api-core';

function features( ...titles: string[] ): CancellationFeature[] {
	return titles.map( ( title, idx ) => ( {
		feature_id: `override-${ idx }`,
		title,
		description: '',
	} ) );
}

/**
 * Client-side override for cancellation features. When the split-cancel-remove
 * flag is on, this replaces the server-provided feature list with
 * benefit-oriented copy keyed by product slug and category.
 *
 * Returns null when no override exists — caller falls back to API features.
 */
export function getOverrideCancellationFeatures(
	purchase: PurchaseForCopy
): CancellationFeature[] | null {
	const slug = purchase.product_slug;

	// Jetpack check first: some Jetpack products have is_plan=true which
	// causes getProductCategory to return 'plan' instead of 'jetpack'.
	if ( purchase.is_jetpack_plan_or_product ) {
		return getJetpackFeatures( slug );
	}

	const category = getProductCategory( purchase );

	switch ( category ) {
		case 'plan':
			return getWpcomPlanFeatures( slug );
		case 'domain':
			return getDomainFeatures( purchase );
		case 'email':
			return getEmailFeatures( slug );
		case 'akismet':
			return getAkismetFeatures();
		case 'marketplace':
			return getMarketplaceFeatures( purchase );
		case 'one-time':
		case 'other':
			return getAddonFeatures( slug );
		default:
			return null;
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getWpcomPlanFeatures( slug: string ): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDomainFeatures( purchase: PurchaseForCopy ): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getEmailFeatures( slug: string ): CancellationFeature[] | null {
	return null;
}

function getJetpackFeatures( slug: string ): CancellationFeature[] | null {
	if ( slug.startsWith( 'jetpack_security' ) ) {
		return features(
			__( 'Priority support' ),
			__( 'Real-time backups with one-click restores' ),
			__( 'Malware scanning with one-click fixes' ),
			__( 'Akismet spam protection' ),
			__( '30-day activity log' ),
			__( 'Brute force attack protection' ),
			__( 'Downtime monitoring' )
		);
	}
	if ( slug.startsWith( 'jetpack_growth' ) ) {
		return features(
			__( 'Priority support' ),
			__( 'Advanced site stats and analytics' ),
			__( 'Social media auto-sharing' ),
			__( 'Newsletter and paid subscriptions' ),
			__( 'Paid content gating and paywalls' ),
			__( 'Display ads with WordAds' ),
			__( '2% transaction fees on payments (vs higher on free)' )
		);
	}
	if ( slug.startsWith( 'jetpack_complete' ) ) {
		return features(
			__( 'Access to the full Jetpack suite' ),
			__( 'Priority support' ),
			__( 'Real-time backups with 1-year history' ),
			__( '1 TB of cloud storage' ),
			__( 'Malware scanning and spam protection' ),
			__( 'Instant site search' ),
			__( '1 TB of ad-free video hosting' ),
			__( 'Site speed and performance tools' )
		);
	}
	if ( slug.startsWith( 'jetpack_ai' ) ) {
		return features(
			__( 'AI content generation in your editor' ),
			__( 'Tone and style adjustments' ),
			__( 'Spelling and grammar help' ),
			__( 'Title and summary generation' ),
			__( 'High request capacity' )
		);
	}
	// Match jetpack_backup but NOT jetpack_backup_addon_storage
	if ( slug.startsWith( 'jetpack_backup' ) && ! slug.includes( 'addon_storage' ) ) {
		return features(
			__( 'Real-time backups as you edit' ),
			__( '10 GB of cloud storage for your backups' ),
			__( 'Unlimited one-click restores from the last 30 days' ),
			__( '30-day activity log' ),
			__( 'Restore from desktop or mobile, even if your site is offline' ),
			__( 'Priority support' )
		);
	}
	if ( slug.startsWith( 'jetpack_boost' ) ) {
		return features(
			__( 'Automatic site speed optimization' ),
			__( 'Image size reduction and quality controls' ),
			__( 'Page caching for faster server response' ),
			__( 'Site performance scores and tracking' ),
			__( 'Historical performance chart' ),
			__( 'Priority support' )
		);
	}
	if ( slug.startsWith( 'jetpack_scan' ) ) {
		return features(
			__( 'Website firewall (WAF)' ),
			__( 'Automated daily malware scanning' ),
			__( 'One-click fixes for most issues' ),
			__( 'Instant email threat notifications' ),
			__( 'Priority support' )
		);
	}
	if ( slug.startsWith( 'jetpack_social' ) ) {
		return features(
			__( 'Auto-share to Facebook, Instagram, LinkedIn, and more' ),
			__( 'Posting to multiple channels at once' ),
			__( 'Scheduled posts' ),
			__( 'Custom images and videos with your posts' ),
			__( 'Auto-generated social images' ),
			__( 'Content recycling for old posts' )
		);
	}
	// Exclude jetpack_search_free
	if ( slug.startsWith( 'jetpack_search' ) && ! slug.includes( 'free' ) ) {
		return features(
			__( 'Instant search results for your visitors' ),
			__( 'Filtering and indexing across your content' ),
			__( 'Support for 38 languages' ),
			__( 'Spelling correction for typos' ),
			__( 'Customizable design to match your site' )
		);
	}
	if ( slug.startsWith( 'jetpack_videopress' ) ) {
		return features(
			__( '1 TB of cloud video hosting' ),
			__( 'Ad-free video playback' ),
			__( '4K video at 60 FPS' ),
			__( 'Customizable video player' ),
			__( 'Video and story blocks for the editor' ),
			__( 'Global CDN for fast delivery' )
		);
	}
	// Exclude free tiers
	if ( slug.startsWith( 'jetpack_stats' ) && ! slug.includes( 'free' ) ) {
		return features(
			__( 'Real-time visitor data' ),
			__( 'Traffic trends for posts and pages' ),
			__( 'Referrer and country insights' ),
			__( 'UTM tracking' ),
			__( 'Commercial use rights' )
		);
	}
	if ( slug.startsWith( 'jetpack_anti_spam' ) ) {
		return features(
			__( 'Spam protection for comments and forms' ),
			__( '10,000 API calls per month' ),
			__( 'CAPTCHA-free spam blocking' ),
			__( 'Priority support' )
		);
	}
	// CRM: no override — fall through to null.
	return null;
}

function getAkismetFeatures(): CancellationFeature[] | null {
	return features(
		__( 'Spam protection for comments and forms' ),
		__( '10,000 API calls per month' ),
		__( 'CAPTCHA-free spam blocking' ),
		__( 'Priority support' )
	);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getMarketplaceFeatures( purchase: PurchaseForCopy ): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAddonFeatures( slug: string ): CancellationFeature[] | null {
	return null;
}
