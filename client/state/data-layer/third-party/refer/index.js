/** @format */

/**
 * External dependencies
 */
import { pick } from 'lodash';
import debug from 'debug';

/**
 * Internal dependencies
 */
import { http } from 'state/http/actions';
import { AFFILIATE_REFERRAL } from 'state/action-types';
import { recordTracksEvent } from 'state/analytics/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

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

const fetch = action => {
	const { affiliateId, campaignId, subId, referrer } = action;

	if ( ! affiliateId || isNaN( affiliateId ) ) {
		return null;
	}

	const requestBody = {
		affiliate_id: affiliateId,
		campaign_id: campaignId || '',
		sub_id: subId || '',
		referrer: referrer || '',
	};

	referDebug( 'Fetching Refer platform response.', action, requestBody );
	return http(
		{
			method: 'POST',
			url: 'https://refer.wordpress.com/clicks/67402',
			headers: [ [ 'Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8' ] ],
			body: requestBody,
			withCredentials: true, // Needed to check and set the 'wp-affiliate-tracker' cookie.
		},
		action
	);
};

const onSuccess = ( action, eventProps ) => {
	referDebug( 'Recording Refer platform success response.', eventProps );
	return recordTracksEvent( 'calypso_refer_visit_response', eventProps );
};

const onError = ( action, error ) => {
	referDebug( 'Recording Refer platform error response.', error );

	if ( ! ( error && error.response && 'string' === typeof error.response.text ) ) {
		return;
	}

	const response = JSON.parse( error.response.text );
	if ( 'object' !== typeof response ) {
		return;
	}

	return recordTracksEvent( 'calypso_refer_visit_response', {
		...pick( response.data || {}, whitelistedEventProps ),
		status: error.response.status || '',
		success: response.success || '',
		description: response.message || 'error',
	} );
};

const fromApi = ( { status, body: { success, message, data } } ) => ( {
	...pick( data, whitelistedEventProps ),
	status: status || '',
	success: success || '',
	description: message || 'success',
} );

registerHandlers( 'state/data-layer/third-party/refer', {
	[ AFFILIATE_REFERRAL ]: [ dispatchRequest( { fetch, fromApi, onSuccess, onError } ) ],
} );
