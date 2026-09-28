import { queryClient, siteCurrentUserQuery, sitePurchasesQuery } from '@automattic/api-queries';
import { getCalendarDaysUntil } from '../../utils/datetime';
import { pickSitewideExpiryPurchase } from '../plan-expiry-notice';
import {
	PURCHASES_STALE_TIME,
	REVERT_NOTICE_DAYS,
	parseRevertedAt,
	siteExpiryTransferQuery,
} from './use-site-expiry-notice';
import type { Site } from '@automattic/api-core';

const ignore = () => undefined;

/**
 * Settle what the sitewide expiry notice needs before a site page paints, so it
 * can outrank the page's own notices. A Simple site with no plan may be past
 * its revert, so its latest transfer is fetched, and inside the revert window
 * the dismissal stamp too, so a dismissal made in wp-admin is honoured. Nothing
 * here may block the page: failures are swallowed and retries are off, and
 * `useSiteExpiryNotice` renders nothing for an errored query. Purchases are
 * refetched only when the hook would find them stale too (`PURCHASES_STALE_TIME`),
 * so a persisted copy from an earlier visit cannot settle the stage; the
 * transfer probe is cached for a day (`TRANSFER_CACHE_TIME`), so a repeat call
 * for the same site within the day makes no request.
 */
export async function ensureSiteExpiryNoticeData(
	site: Pick< Site, 'ID' | 'is_wpcom_atomic' >
): Promise< void > {
	const siteId = site.ID;
	const purchases = await queryClient
		.fetchQuery( {
			...sitePurchasesQuery( siteId ),
			staleTime: PURCHASES_STALE_TIME,
			retry: false,
		} )
		.catch( ignore );
	if ( ! purchases || pickSitewideExpiryPurchase( purchases ) || site.is_wpcom_atomic ) {
		return;
	}

	const transfer = await queryClient
		.fetchQuery( { ...siteExpiryTransferQuery( siteId ), retry: false } )
		.catch( ignore );
	const revertedAt = parseRevertedAt( transfer );
	if (
		revertedAt === null ||
		-getCalendarDaysUntil( new Date( revertedAt ) ) >= REVERT_NOTICE_DAYS
	) {
		return;
	}

	await queryClient
		.fetchQuery( { ...siteCurrentUserQuery( siteId ), retry: false } )
		.catch( ignore );
}
