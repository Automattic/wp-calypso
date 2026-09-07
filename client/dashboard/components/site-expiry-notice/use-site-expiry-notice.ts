import { isWpError, PLAN_EXPIRY_NOTICE_DISMISS_META_KEY } from '@automattic/api-core';
import {
	siteCurrentUserQuery,
	siteLatestAtomicTransferQuery,
	sitePurchasesQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { getPlanExpiryNotice, pickSitewideExpiryPurchase } from '../plan-expiry-notice';
import type { PlanExpiryNoticeStage } from '../plan-expiry-notice';
import type { Purchase } from '@automattic/api-core';

export interface SiteExpiryNoticeOptions {
	/**
	 * Whether the current screen is the site's landing page (My Home in
	 * Calypso, the overview in the dashboard). The early warning, more than a
	 * week before expiry, shows only there; wp-admin limits it to its Dashboard
	 * the same way.
	 */
	isDashboardScreen: boolean;
	locale: string;
	renewReturnUrl?: string;
	viewOtherPlansUrl?: string;
}

export interface SiteExpiryNoticeState {
	purchase: Purchase;
	stage: PlanExpiryNoticeStage;
	isDismissible: boolean;
	isReverted: boolean;
}

/**
 * A dismissal only counts for the term it was made in: the server stamps the
 * time of the click, so a stamp older than the current expiry date belongs to
 * a previous term and the notice comes back. Same rule as
 * `Expiry_Notice_Dismiss::is_dismissed()` in jetpack-mu-wpcom.
 */
export function isPlanExpiryNoticeDismissed(
	dismissedAt: number | undefined,
	purchase: Purchase
): boolean {
	if ( ! dismissedAt ) {
		return false;
	}
	return dismissedAt * 1000 > new Date( purchase.expiry_date ).getTime();
}

/**
 * A 4xx is the server's definitive answer — the transfer endpoint replies 404
 * (`no_transfer_record`) for a site that was never transferred. Anything else
 * may be transient.
 */
function isClientError( error: unknown ): boolean {
	return isWpError( error ) && error.status >= 400 && error.status < 500;
}

/**
 * Everything the sitewide expiry banner needs to know about one site, or null
 * when nothing should show. Kept apart from the banner so that a host can
 * settle eligibility before rendering anything (the dashboard's notice arbiter
 * needs that), and so that the banner never has to return null on its own.
 */
export function useSiteExpiryNotice(
	siteId: number,
	{ isDashboardScreen, locale, renewReturnUrl, viewOtherPlansUrl }: SiteExpiryNoticeOptions
): SiteExpiryNoticeState | null {
	// Hosts may render before a site is selected; `0` must never hit the API.
	const { data: purchases } = useQuery( { ...sitePurchasesQuery( siteId ), enabled: siteId > 0 } );
	const purchase = purchases ? pickSitewideExpiryPurchase( purchases ) : null;

	const { data: currentUser, isFetchedAfterMount: isCurrentUserFetched } = useQuery( {
		...siteCurrentUserQuery( siteId ),
		enabled: !! purchase,
	} );

	const isPastGrace =
		!! purchase &&
		getPlanExpiryNotice( purchase, { scope: 'sitewide', locale } )?.stage === 'post-grace';

	const {
		data: latestTransfer,
		isPending: isTransferPending,
		error: transferError,
	} = useQuery( {
		...siteLatestAtomicTransferQuery( siteId ),
		enabled: isPastGrace,
		// The 404 for a site that was never transferred is an answer, not a
		// failure: take it at once instead of holding the banner back for
		// seconds. Anything else gets the client's usual retries.
		retry: ( failureCount, error ) => ! isClientError( error ) && failureCount < 3,
	} );
	const isReverted = latestTransfer?.status === 'reverted';

	if ( ! purchase ) {
		return null;
	}

	// Until the transfer status is known, a reverted site would be offered
	// "Restore site" and then have it swapped for "Contact support".
	if ( isPastGrace && isTransferPending ) {
		return null;
	}

	// A 5xx or a network failure leaves the revert state unknown, and the wrong
	// guess offers "Restore site" to a site that is already reverted.
	if ( isPastGrace && transferError && ! isClientError( transferError ) ) {
		return null;
	}

	const notice = getPlanExpiryNotice( purchase, {
		scope: 'sitewide',
		locale,
		renewReturnUrl,
		viewOtherPlansUrl,
		isReverted,
	} );
	if ( ! notice?.stage ) {
		return null;
	}

	if ( notice.stage === 'early-warning' && ! isDashboardScreen ) {
		return null;
	}

	const isDismissible = notice.stage === 'post-grace';

	// A dismissal made on another surface only arrives with this fetch, so a
	// cached copy from before it would flash the notice back up.
	if ( isDismissible && ! isCurrentUserFetched ) {
		return null;
	}

	if (
		isDismissible &&
		isPlanExpiryNoticeDismissed(
			currentUser?.meta?.[ PLAN_EXPIRY_NOTICE_DISMISS_META_KEY ],
			purchase
		)
	) {
		return null;
	}

	return { purchase, stage: notice.stage, isDismissible, isReverted };
}

export function useShouldShowSiteExpiryNotice(
	siteId: number,
	options: SiteExpiryNoticeOptions
): boolean {
	return useSiteExpiryNotice( siteId, options ) !== null;
}
