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
	// Obtain the referrer URL and parse it
	const referrer = getReferrer();
	const parsedUrl = urlParseAmpCompatible( referrer );
	const affiliateId =
		parsedUrl?.searchParams.get( 'aff' ) || parsedUrl?.searchParams.get( 'affiliate' );
	const campaignId = parsedUrl?.searchParams.get( 'cid' );
	const subId = parsedUrl?.searchParams.get( 'sid' );
	const vendor = getVendor();

	if ( affiliateId && ! isNaN( affiliateId ) ) {
		recordTracksEvent( 'calypso_refer_visit', {
			page: parsedUrl.host + parsedUrl.pathname,
		} );

		trackAffiliateReferral( { vendor, affiliateId, campaignId, subId, referrer } );
	}
}

/**
 * Determines the appropriate vendor ID based on the URL.
 *
 * @param {URL} parsedUrl - Parsed URL object from urlParseAmpCompatible function.
 * @returns {number} - The appropriate affiliate vendor ID.
 */
function getVendor( parsedUrl ) {
	if ( parsedUrl.pathname === '/setup/wooexpress/' ) {
		return WOOEXPRESS_AFFILIATE_VENDOR_ID;
	}
	return WPCOM_AFFILIATE_VENDOR_ID;
}

/**
 * Returns the correct referrer based on the URL.
 *
 * @returns {string} - The referrer URL.
 */
function getReferrer() {
	/**
	 * This is quite hacky, however since affiliates share https://woocommerce.com/express/
	 * and the user gets redirected to http://wordpress.com/setup/wooexpress/ as 23rd/Aug/23,
	 * We assume the referring URL is https://woocommerce.com/express/
	 */
	if ( window.location.href.includes( 'http://wordpress.com/setup/wooexpress/' ) ) {
		return 'https://woocommerce.com/express/';
	}
	return window.location.href;
}
