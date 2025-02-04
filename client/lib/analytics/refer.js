// Refer platform tracking.

import { urlParseAmpCompatible } from 'calypso/lib/analytics/utils';
import { WOOEXPRESS_AFFILIATE_VENDOR_ID, WPCOM_AFFILIATE_VENDOR_ID } from './ad-tracking/constants';
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
	const vid = parsedUrl?.searchParams.get( 'vid' );
	const campaignId = parsedUrl?.searchParams.get( 'cid' );
	const subId = parsedUrl?.searchParams.get( 'sid' );
	const vendorId =
		vid === WOOEXPRESS_AFFILIATE_VENDOR_ID
			? WOOEXPRESS_AFFILIATE_VENDOR_ID
			: WPCOM_AFFILIATE_VENDOR_ID;

	if ( affiliateId && ! isNaN( affiliateId ) ) {
		recordTracksEvent( 'calypso_refer_visit', {
			page: parsedUrl.host + parsedUrl.pathname,
		} );

		trackAffiliateReferral( { vendorId, affiliateId, campaignId, subId, referrer } );
	}
}
