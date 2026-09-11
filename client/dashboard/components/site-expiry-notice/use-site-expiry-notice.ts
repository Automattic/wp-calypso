import { isWpError } from '@automattic/api-core';
import {
	siteCurrentUserQuery,
	siteLatestAtomicTransferQuery,
	sitePurchasesQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	getPlanExpiryNotice,
	getSitewideExpiryStage,
	pickSitewideExpiryPurchase,
} from '../plan-expiry-notice';
import { findPlanExpiryNoticeDismissMetaKey, isPlanExpiryNoticeDismissed } from './dismissal';
import type { PlanExpiryNoticeStage } from '../plan-expiry-notice';
import type { Purchase } from '@automattic/api-core';

export interface SiteExpiryNoticeOptions {
	/**
	 * Whether the current screen is the site's landing page. The early warning,
	 * more than a week before expiry, shows only there; wp-admin limits it to
	 * its Dashboard the same way.
	 */
	isDashboardScreen: boolean;

	/** Tells the plan's owner from any other administrator. */
	currentUserId: number;

	/**
	 * Past the grace period, an Atomic site that has not been reverted has lost
	 * nothing yet, and is told so in the grace period's words; mirrors
	 * `wpcom_expiry_notices_revert_applies_to_site()`.
	 */
	isAtomic: boolean;
	locale: string;
}

export interface SiteExpiryNoticeState {
	purchase: Purchase;
	stage: PlanExpiryNoticeStage;
	isDismissible: boolean;
	isReverted: boolean;
	isPlanOwner: boolean;
	/** The per-site meta key a dismissal writes to. Present when dismissible. */
	dismissMetaKey?: string;
}

/** The stages that outrank every page notice: the site is a week or less from losing its plan, or already has. */
export function isUrgentStage( stage: PlanExpiryNoticeStage ): boolean {
	return stage !== 'early-warning';
}

/**
 * A 4xx is the server's definitive answer: the transfer endpoint replies 404
 * for a site that was never transferred. Anything else may be transient.
 */
function isClientError( error: unknown ): boolean {
	return isWpError( error ) && error.status >= 400 && error.status < 500;
}

/**
 * Everything the sitewide expiry banner needs to know about one site, or null
 * when nothing should show. Plain queries, not suspense: the dashboard's route
 * loader has already settled them (see `ensureSiteExpiryNoticeData`), and a
 * query the loader let fail must render nothing rather than throw to an error
 * boundary.
 */
export function useSiteExpiryNotice(
	siteId: number,
	{ isDashboardScreen, currentUserId, isAtomic, locale }: SiteExpiryNoticeOptions
): SiteExpiryNoticeState | null {
	// Hosts may render before a site is selected; `0` must never hit the API.
	const { data: purchases } = useQuery( { ...sitePurchasesQuery( siteId ), enabled: siteId > 0 } );
	const purchase = purchases ? pickSitewideExpiryPurchase( purchases ) : null;
	const isPostGrace = !! purchase && getSitewideExpiryStage( purchase ) === 'post-grace';

	// `dataUpdatedAt` rather than `isFetchedAfterMount`: the loader has usually
	// fetched the meta already, and a cache the loader filled is a fetch too.
	const { data: currentUser, dataUpdatedAt: currentUserUpdatedAt } = useQuery( {
		...siteCurrentUserQuery( siteId ),
		enabled: isPostGrace,
	} );
	const isCurrentUserFetched = currentUserUpdatedAt > 0;

	const {
		data: latestTransfer,
		isPending: isLatestTransferPending,
		error: latestTransferError,
	} = useQuery( {
		...siteLatestAtomicTransferQuery( siteId ),
		enabled: isPostGrace,
		// The 404 for a site that was never transferred is an answer, not a
		// failure: take it at once instead of holding the banner back for
		// seconds. Anything else gets the client's usual retries.
		retry: ( failureCount, error ) => ! isClientError( error ) && failureCount < 3,
	} );

	if ( ! purchase ) {
		return null;
	}

	// Derived from the notice itself, not from `getSitewideExpiryStage`: an
	// auto-renewing annual plan before its first renewal attempt has a stage
	// window but no notice, and a candidate must never self-null.
	const notice = getPlanExpiryNotice( purchase, { scope: 'sitewide', locale } );
	let stage = notice?.stage ?? null;
	if ( ! stage ) {
		return null;
	}
	if ( stage === 'early-warning' && ! isDashboardScreen ) {
		return null;
	}

	const isPlanOwner = String( purchase.user_id ) === String( currentUserId );
	let isReverted = false;

	if ( stage === 'post-grace' ) {
		// Until the transfer status is known, a reverted site would be offered
		// "Restore site" and then have it swapped for "Contact support".
		if ( isLatestTransferPending ) {
			return null;
		}
		// A 5xx or a network failure leaves the revert state unknown, and the
		// wrong guess offers "Restore site" to a site that is already reverted.
		if ( latestTransferError && ! isClientError( latestTransferError ) ) {
			return null;
		}
		isReverted = latestTransfer?.status === 'reverted';

		if ( ! isReverted && isAtomic ) {
			stage = 'grace';
		}
	}

	const isDismissible = stage === 'post-grace';
	if ( ! isDismissible ) {
		return { purchase, stage, isDismissible, isReverted, isPlanOwner };
	}

	// A dismissal made on another surface only arrives with this fetch, so a
	// cached copy from before it would flash the notice back up.
	if ( ! isCurrentUserFetched ) {
		return null;
	}
	const dismissMetaKey = findPlanExpiryNoticeDismissMetaKey( currentUser?.meta );
	if (
		dismissMetaKey &&
		isPlanExpiryNoticeDismissed( currentUser?.meta?.[ dismissMetaKey ], purchase )
	) {
		return null;
	}

	return { purchase, stage, isDismissible, isReverted, isPlanOwner, dismissMetaKey };
}
