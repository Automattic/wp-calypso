import { isEnabled } from '@automattic/calypso-config';
import {
	hasQueryableSite,
	isCentennialPurchase,
	isDotcomPlan,
	isExpiredOrRemoved,
	isManageableByUser,
} from '../../../utils/purchase';
import type { Purchase, Site } from '@automattic/api-core';

export function useIsPurchaseSiteTransferEnabled(): boolean {
	return isEnabled( 'purchases/site-transfer' );
}

/**
 * Whether the purchase is a kind its owner can move to another of their sites:
 * an active WordPress.com plan or domain on a real site.
 *
 * The site transfer preview has the final say. This only rules out purchases
 * that could never move, so the action isn't offered for them.
 */
export function isPurchaseMovableToAnotherSite( purchase: Purchase ): boolean {
	if ( ! isDotcomPlan( purchase ) && ! purchase.is_domain ) {
		return false;
	}

	if ( isExpiredOrRemoved( purchase ) || ! hasQueryableSite( purchase ) ) {
		return false;
	}

	if ( purchase.is_host_managed || ! isManageableByUser( purchase ) ) {
		return false;
	}

	return ! isCentennialPurchase( purchase ) && ! purchase.is_trial_plan;
}

/**
 * Whether a site could receive the purchase. Like
 * `isPurchaseMovableToAnotherSite()`, this only hides sites the preview would
 * always refuse, such as sites that already have a plan when moving a plan.
 */
export function canSiteReceivePurchase( purchase: Purchase, site: Site ): boolean {
	if ( site.ID === purchase.blog_id ) {
		return false;
	}

	if ( site.is_wpcom_staging_site || site.is_vip || site.is_a4a_dev_site ) {
		return false;
	}

	// Self-hosted Jetpack sites. Atomic sites report `jetpack` too.
	if ( site.jetpack && ! site.is_wpcom_atomic ) {
		return false;
	}

	// Domains can move to and from Atomic sites, but a plan can only move to a
	// Simple site without a plan of its own.
	if ( isDotcomPlan( purchase ) ) {
		return ! site.is_wpcom_atomic && Boolean( site.plan?.is_free );
	}

	return true;
}
