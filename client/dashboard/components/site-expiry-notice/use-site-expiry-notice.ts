import { isWpError } from '@automattic/api-core';
import {
	siteCurrentUserQuery,
	siteLatestAtomicTransferQuery,
	sitePurchasesQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { getCalendarDaysUntil } from '../../utils/datetime';
import { getPlanExpiryNotice, pickSitewideExpiryPurchase } from '../plan-expiry-notice';
import { findPlanExpiryNoticeDismissMetaKey, isPlanExpiryNoticeDismissed } from './dismissal';
import type { PlanExpiryNoticeStage } from '../plan-expiry-notice';
import type { AtomicTransfer, Purchase } from '@automattic/api-core';

/** How long after the automatic revert support can still restore the site; matches wp-admin. */
export const REVERT_NOTICE_DAYS = 30;

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
export function parseRevertedAt( transfer: AtomicTransfer | undefined ): number | null {
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
	// Fresh for a while: every site page mounts the arbiter, so the client's
	// stale-at-once default would refetch purchases on each navigation.
	const { data: purchases, isSuccess: hasPurchases } = useQuery( {
		...sitePurchasesQuery( siteId ),
		enabled: siteId > 0,
		staleTime: 5 * 60 * 1000,
	} );
	const purchase = purchases ? pickSitewideExpiryPurchase( purchases ) : null;

	// Only a Simple site with no plan can be past the revert.
	const mayBeReverted = hasPurchases && ! purchase && ! isAtomic;

	const { data: latestTransfer, isPending: isTransferPending } = useQuery( {
		...siteLatestAtomicTransferQuery( siteId ),
		enabled: mayBeReverted,
		// The 404 for a site that was never transferred is an answer, not a
		// failure: the loader stored it, and refetching it on mount would make
		// the first render pending and the notice pop in a round trip late.
		retryOnMount: false,
		retry: ( failureCount, error ) => ! isClientError( error ) && failureCount < 3,
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
