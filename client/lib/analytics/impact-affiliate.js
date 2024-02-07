import cookie from 'cookie';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import urlParseAmpCompatible from './utils/url-parse-amp-compatible';

/**
 * Save Impact Affiliate Click ID in a cookie if it is set as a query parameter.
 */
export default function saveImpactAffiliateClickId() {
	// Read click ID query argument, return early if there is none.
	const parsedUrl = urlParseAmpCompatible( window.location.href );
	const clickId = parsedUrl?.searchParams.get( 'irclickid' );

	if ( ! clickId ) {
		return;
	}

	document.cookie = cookie.serialize( 'irclickid', clickId, {
		path: '/',
		expires: new Date( Date.now() + 30 * 24 * 60 * 60 * 1000 ), // 30 days
		domain: '.wordpress.com',
	} );

	recordTracksEvent( 'calypso_impact_affiliate_visit', {
		page: parsedUrl.host + parsedUrl.pathname,
	} );
}
