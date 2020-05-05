// Refer platform tracking.

/**
 * Internal dependencies
 */
import { urlParseAmpCompatible } from 'lib/analytics/utils';
import { trackAffiliateReferral } from './track-affiliate-referral';
import { recordTracksEvent } from './tracks';

export function referRecordPageView() {
	if ( ! window || ! window.location ) {
		return; // Not possible.
	}

	const referrer = window.location.href;
	const parsedUrl = urlParseAmpCompatible( referrer );
	const affiliateId =
		parsedUrl?.searchParams.get( 'aff' ) || parsedUrl?.searchParams.get( 'affiliate' );
	const campaignId = parsedUrl?.searchParams.get( 'cid' );
	const subId = parsedUrl?.searchParams.get( 'sid' );

	if ( affiliateId && ! isNaN( affiliateId ) ) {
		recordTracksEvent( 'calypso_refer_visit', {
			page: parsedUrl.host + parsedUrl.pathname,
		} );

		trackAffiliateReferral( { affiliateId, campaignId, subId, referrer } );
	}
}
