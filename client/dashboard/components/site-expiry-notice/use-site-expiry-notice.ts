import { fetchLatestAtomicTransfer, isWpError } from '@automattic/api-core';
import { siteCurrentUserQuery, sitePurchasesQuery } from '@automattic/api-queries';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { getCalendarDaysUntil } from '../../utils/datetime';
import { getPlanExpiryNotice, pickSitewideExpiryPurchase } from '../plan-expiry-notice';
import { findPlanExpiryNoticeDismissMetaKey, isPlanExpiryNoticeDismissed } from './dismissal';
import type { PlanExpiryNoticeStage } from '../plan-expiry-notice';
import type { AtomicTransfer, Purchase } from '@automattic/api-core';

/**
 * How long after the automatic revert support can still restore the site;
 * matches wp-admin. Measured in the viewer's calendar days against a UTC
 * revert instant, so it can end a day early or late relative to wp-admin for
 * a viewer far from UTC; accepted for a 30-day support window.
 */
export const REVERT_NOTICE_DAYS = 30;

/** How long a fetched purchases list stays fresh for the notice; every site page mounts the arbiter, so the client's stale-at-once default would refetch on each navigation. */
export const PURCHASES_STALE_TIME = 5 * 60 * 1000;

/** A revert cannot un-happen within a day, and the negative answer -- no transfer yet -- is the common case for a Free site; caching it this long is what keeps the probe from costing every hover-preload and navigation. */
export const TRANSFER_CACHE_TIME = 24 * 60 * 60 * 1000;

export interface SiteExpiryNoticeOptions {
	/**
	 * Whether the current screen is the site's landing page. The early warning,
	 * more than a week before expiry, shows only there; wp-admin limits it to
	 * its Dashboard the same way.
	 */
	isDashboardScreen: boolean;

	/** Tells the plan's owner from any other administrator. */
	currentUserId: number;

	/** An Atomic site still has its plan or is about to be reverted; only a Simple site can be past the revert. */
	isAtomic: boolean;
	locale: string;
}

export interface SiteExpiryPurchaseState {
	kind: 'purchase';
	purchase: Purchase;
	stage: PlanExpiryNoticeStage;
	isPlanOwner: boolean;
}

export interface SiteExpiryRevertedState {
	kind: 'reverted';
	/** Milliseconds since the epoch. */
	revertedAt: number;
	/** The per-site meta key a dismissal writes to, when the site exposes it. */
	dismissMetaKey?: string;
}

export type SiteExpiryNoticeState = SiteExpiryPurchaseState | SiteExpiryRevertedState;

/** Everything but the early warning outranks the page's own notices. */
export function isUrgentState( state: SiteExpiryNoticeState ): boolean {
	return state.kind === 'reverted' || state.stage !== 'early-warning';
}

/**
 * The revert time in milliseconds, or null when the transfer is not the
 * automatic expiry revert. `reverted_at` is `Y-m-d H:i:s` in UTC.
 */
export function parseRevertedAt( transfer: AtomicTransfer | null | undefined ): number | null {
	if (
		! transfer ||
		transfer.status !== 'reverted' ||
		! transfer.reverted_for_expired_plan ||
		! transfer.reverted_at
	) {
		return null;
	}
	const revertedAt = new Date( transfer.reverted_at.replace( ' ', 'T' ) + 'Z' ).getTime();
	return Number.isNaN( revertedAt ) ? null : revertedAt;
}

function isClientError( error: unknown ): boolean {
	return isWpError( error ) && error.status >= 400 && error.status < 500;
}

/**
 * The site's latest Atomic transfer, cached for a day (`TRANSFER_CACHE_TIME`):
 * a 404 -- never transferred -- is mapped to `null` rather than left as a
 * query error, so the common negative answer for a Free site is a cached
 * value instead of a repeated failed probe. A distinct key from
 * `siteLatestAtomicTransferQuery`: that shared query is typed `AtomicTransfer`
 * and errors on a 404, and other consumers rely on that.
 */
export function siteExpiryTransferQuery( siteId: number ) {
	return queryOptions( {
		queryKey: [ 'site', siteId, 'expiry-notice', 'transfer' ],
		queryFn: async () => {
			try {
				return await fetchLatestAtomicTransfer( siteId );
			} catch ( error ) {
				if ( isClientError( error ) ) {
					return null;
				}
				throw error;
			}
		},
		staleTime: TRANSFER_CACHE_TIME,
		// Kept explicit rather than relying on the shared client's retry
		// defaults, so this query's retry behaviour doesn't drift with them.
		retry: ( failureCount: number, error: unknown ) => ! isClientError( error ) && failureCount < 3,
	} );
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
	const { data: purchases, isSuccess: hasPurchases } = useQuery( {
		...sitePurchasesQuery( siteId ),
		enabled: siteId > 0,
		staleTime: PURCHASES_STALE_TIME,
	} );
	const purchase = purchases ? pickSitewideExpiryPurchase( purchases ) : null;

	// Only a Simple site with no plan can be past the revert.
	const mayBeReverted = hasPurchases && ! purchase && ! isAtomic;

	const { data: latestTransfer, isPending: isTransferPending } = useQuery( {
		...siteExpiryTransferQuery( siteId ),
		enabled: mayBeReverted,
		// The 404 for a site that was never transferred is a cached answer, not
		// a failure: the loader stored it, and refetching it on mount would make
		// the first render pending and the notice pop in a round trip late. This
		// also means a 5xx left behind by the loader is not retried on mount
		// either -- the notice stays silent until a window-focus refetch or a
		// reload, which is preferred to a late pop-in.
		retryOnMount: false,
	} );
	const revertedAt = mayBeReverted ? parseRevertedAt( latestTransfer ) : null;
	const isInRevertWindow =
		revertedAt !== null && -getCalendarDaysUntil( new Date( revertedAt ) ) < REVERT_NOTICE_DAYS;

	// `dataUpdatedAt` rather than `isFetchedAfterMount`: the loader has usually
	// fetched the meta already, and a cache the loader filled is a fetch too.
	const { data: currentUser, dataUpdatedAt: currentUserUpdatedAt } = useQuery( {
		...siteCurrentUserQuery( siteId ),
		enabled: isInRevertWindow,
	} );

	if ( purchase ) {
		// Derived from the notice itself, not from `getSitewideExpiryStage`: an
		// auto-renewing annual plan before its first renewal attempt has a stage
		// window but no notice, and a candidate must never self-null.
		const stage = getPlanExpiryNotice( purchase, { scope: 'sitewide', locale } )?.stage ?? null;
		if ( ! stage || ( stage === 'early-warning' && ! isDashboardScreen ) ) {
			return null;
		}
		return {
			kind: 'purchase',
			purchase,
			stage,
			isPlanOwner: String( purchase.user_id ) === String( currentUserId ),
		};
	}

	if ( ! mayBeReverted || isTransferPending || ! isInRevertWindow ) {
		return null;
	}

	// A dismissal made on another surface only arrives with this fetch, so a
	// cached copy from before it would flash the notice back up.
	if ( currentUserUpdatedAt === 0 ) {
		return null;
	}
	const dismissMetaKey = findPlanExpiryNoticeDismissMetaKey( currentUser?.meta );
	if (
		dismissMetaKey &&
		isPlanExpiryNoticeDismissed( currentUser?.meta?.[ dismissMetaKey ], revertedAt )
	) {
		return null;
	}

	return { kind: 'reverted', revertedAt, dismissMetaKey };
}
