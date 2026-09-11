import {
	queryClient,
	siteCurrentUserQuery,
	siteLatestAtomicTransferQuery,
	sitePurchasesQuery,
} from '@automattic/api-queries';
import { getSitewideExpiryStage, pickSitewideExpiryPurchase } from '../plan-expiry-notice';

const ignore = () => undefined;

/**
 * Settle what the sitewide expiry notice needs before a site page paints, so
 * the notice is there on first render and can outrank the page's own notices.
 * Only post-grace needs the dismissal stamp and the revert status, and those
 * are fetched fresh so a dismissal made in wp-admin is honoured on the next
 * dashboard load. Nothing here may block the page: failures are swallowed and
 * `useSiteExpiryNotice` renders nothing for an errored query.
 */
export async function ensureSiteExpiryNoticeData( siteId: number ): Promise< void > {
	const purchases = await queryClient
		.ensureQueryData( sitePurchasesQuery( siteId ) )
		.catch( ignore );
	if ( ! purchases ) {
		return;
	}

	const purchase = pickSitewideExpiryPurchase( purchases );
	if ( ! purchase || getSitewideExpiryStage( purchase ) !== 'post-grace' ) {
		return;
	}

	await Promise.all( [
		queryClient.fetchQuery( siteCurrentUserQuery( siteId ) ).catch( ignore ),
		queryClient
			.fetchQuery( { ...siteLatestAtomicTransferQuery( siteId ), retry: false } )
			.catch( ignore ),
	] );
}
