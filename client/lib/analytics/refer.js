// Refer platform tracking.

import { urlParseAmpCompatible } from 'calypso/lib/analytics/utils';
import { trackAffiliateReferral } from './track-affiliate-referral';
import { recordTracksEvent } from './tracks';

// Constants for Affiliate Vendor IDs
const WOOEXPRESS_AFFILIATE_VENDOR_ID = 67386441;
const WPCOM_AFFILIATE_VENDOR_ID = 67402;

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
 * Determines the appropriate affiliate vendor ID based on the URL.
 *
 * @param {URL} parsedUrl - Parsed URL object from urlParseAmpCompatible function.
 * @returns {number} - The appropriate affiliate vendor ID.
 */
function getVendor( parsedUrl ) {
	const hasWooexpressParams =
		parsedUrl.searchParams.get( 'variationName' ) === 'wooexpress' &&
		parsedUrl.searchParams.get( 'redirect_to' ) === '/setup/wooexpress?variationName=wooexpress';

	if ( hasWooexpressParams ) {
		return WOOEXPRESS_AFFILIATE_VENDOR_ID;
	}
	return WPCOM_AFFILIATE_VENDOR_ID;
}
