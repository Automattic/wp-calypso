// Refer platform tracking.

import { urlParseAmpCompatible } from 'calypso/lib/analytics/utils';
import { WOOEXPRESS_AFFILIATE_VENDOR_ID, WPCOM_AFFILIATE_VENDOR_ID } from './ad-tracking/constants';
import { trackAffiliateReferral } from './track-affiliate-referral';
import { recordTracksEvent } from './tracks';

export function referRecordPageView() {
	if ( ! window || ! window.location ) {
		return; // Not possible.
	}

	const parsedUrl = urlParseAmpCompatible( window.location.href );

	// Obtain the referrer URL and parse it
	const affiliateId =
		parsedUrl?.searchParams.get( 'aff' ) || parsedUrl?.searchParams.get( 'affiliate' );

	if ( ! affiliateId || isNaN( affiliateId ) ) {
		return;
	}

	const vendor = getVendor( parsedUrl );
	let referrer = window.location.href;

	if ( vendor === WOOEXPRESS_AFFILIATE_VENDOR_ID ) {
		// Hard-coded referrer for specific wooexpress vendor
		referrer = 'https://woocommerce.com/express/';
	}

	const campaignId = parsedUrl?.searchParams.get( 'cid' );
	const subId = parsedUrl?.searchParams.get( 'sid' );

	recordTracksEvent( 'calypso_refer_visit', {
		page: parsedUrl.host + parsedUrl.pathname,
	} );

	trackAffiliateReferral( { vendor, affiliateId, campaignId, subId, referrer } );
}

/**
 * Determines the url path is for setting up a new Wooexpress account on WPCOM
 *
 * @param {URL} parsedUrl - Parsed URL object from urlParseAmpCompatible function.
 * @returns {boolean} - Whether the path has the required parameters for Wooexpress.
 */
function isNewWooexpressPath( parsedUrl ) {
	const path = parsedUrl.pathname;
	return (
		parsedUrl.searchParams.get( 'variationName' ) === 'wooexpress' &&
		path &&
		path.includes( '/start/account/user' )
	);
}

/**
 * Determines the appropriate affiliate vendor ID based on the URL.
 *
 * @param {URL} parsedUrl - Parsed URL object from urlParseAmpCompatible function.
 * @returns {number} - The appropriate affiliate vendor ID.
 */
function getVendor( parsedUrl ) {
	if ( isNewWooexpressPath( parsedUrl ) ) {
		return WOOEXPRESS_AFFILIATE_VENDOR_ID;
	}
	return WPCOM_AFFILIATE_VENDOR_ID;
}
