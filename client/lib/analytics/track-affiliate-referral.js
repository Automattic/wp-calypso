/**
 * External dependencies
 */
import { pick } from 'lodash';
import debug from 'debug';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';

const referDebug = debug( 'calypso:analytics:refer' );

const whitelistedEventProps = [
	'status',
	'success',
	'duplicate',
	'description',
	'cookie_id',
	'vendor_id',
	'affiliate_id',
	'campaign_id',
	'sub_id',
	'referrer',
];

export async function trackAffiliateReferral( { affiliateId, campaignId, subId, referrer } ) {
	referDebug( 'Recording affiliate referral.', { affiliateId, campaignId, subId, referrer } );

	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		Accept: 'application/json',
	};

	const body = new URLSearchParams( {
		affiliate_id: affiliateId,
		campaign_id: campaignId || '',
		sub_id: subId || '',
		referrer: referrer || '',
	} ).toString();

	referDebug( 'Fetching Refer platform response.' );

	try {
		const response = await window.fetch( 'https://refer.wordpress.com/clicks/67402', {
			withCredentials: true, // Needed to check and set the 'wp-affiliate-tracker' cookie.
			method: 'POST',
			headers,
			body,
		} );

		const json = await response.json();

		if ( response.ok ) {
			referDebug( 'Recording Refer platform success response.', json );
			recordTracksEvent( 'calypso_refer_visit_response', {
				...pick( json.data, whitelistedEventProps ),
				status: response.status || '',
				success: json.success || true,
				description: json.message || 'success',
			} );
			return;
		}

		referDebug( 'Recording Refer platform error response.', json );
		recordTracksEvent( 'calypso_refer_visit_response', {
			...pick( json.data, whitelistedEventProps ),
			status: response.status || '',
			success: json.success || false,
			description: json.message || 'error',
		} );
	} catch ( error ) {
		// Exception from `fetch` usually means network error. Don't report these to Tracks.
		referDebug( 'Failed to fetch Refer platform response.', error );
	}
}
