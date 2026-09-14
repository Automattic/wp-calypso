import {
	queryClient,
	siteCurrentUserQuery,
	siteLatestAtomicTransferQuery,
	sitePurchasesQuery,
} from '@automattic/api-queries';
import { getCalendarDaysUntil } from '../../utils/datetime';
import { pickSitewideExpiryPurchase } from '../plan-expiry-notice';
import { REVERT_NOTICE_DAYS, parseRevertedAt } from './use-site-expiry-notice';
import type { Site } from '@automattic/api-core';

const ignore = () => undefined;

/**
 * Settle what the sitewide expiry notice needs before a site page paints, so it
 * can outrank the page's own notices. A Simple site with no plan may be past
 * its revert, so its latest transfer is fetched, and inside the revert window
 * the dismissal stamp too, so a dismissal made in wp-admin is honoured. Nothing
 * here may block the page: failures are swallowed and retries are off, and
 * `useSiteExpiryNotice` renders nothing for an errored query.
 */
export async function ensureSiteExpiryNoticeData(
	site: Pick< Site, 'ID' | 'is_wpcom_atomic' >
): Promise< void > {
	const siteId = site.ID;
	const purchases = await queryClient
		.ensureQueryData( { ...sitePurchasesQuery( siteId ), retry: false } )
		.catch( ignore );
	if ( ! purchases || pickSitewideExpiryPurchase( purchases ) || site.is_wpcom_atomic ) {
		return;
	}

	const transfer = await queryClient
		.fetchQuery( { ...siteLatestAtomicTransferQuery( siteId ), retry: false } )
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
