/** @format */

/**
 * External dependencies
 */
import { pick } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/http/actions';
import { AFFILIATE_REFERRAL } from 'state/action-types';

const debug = debugFactory( 'calypso:analytics:aff-tracking' );

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

const trackAffiliatePageLoad = action => {
	const { affiliateId, campaignId, subId, urlPath } = action;

	if ( ! affiliateId || isNaN( affiliateId ) ) {
		return null;
	}

	return http(
		{
			method: 'POST',
			url: 'https://refer.wordpress.com/clicks/67402',
			headers: [ [ 'content-type', 'application/x-www-form-urlencoded; charset=UTF-8' ] ],
			body: {
				affiliate_id: affiliateId,
				campaign_id: campaignId || '',
				sub_id: subId || '',
				referrer: urlPath,
			},
			// Needed to check and set the 'wp-affiliate-tracker' cookie
			withCredentials: true,
		},
		action
	);
};

const onTrackAffiliatePageLoadSuccess = ( action, response ) => {
	if (
		'object' !== typeof response ||
		'object' !== typeof response.body ||
		'object' !== typeof response.body.data
	) {
		debug( 'Unexpected referral response: ', response );
		return; // Not possible.
	}

	const responseBody = response.body;
	const responseData = responseBody.data;
	const eventProps = pick( responseData, whitelistedEventProps );

	eventProps.status = response.status || '';
	eventProps.success = responseBody.success || '';
	eventProps.description = responseBody.message || 'success';

	analytics.tracks.recordEvent( 'calypso_refer_visit_response', eventProps );
};

const onTrackAffiliatePageLoadError = ( action, error ) => {
	if (
		'object' !== typeof error ||
		'object' !== typeof error.response ||
		'string' !== typeof error.response.text
	) {
		debug( 'Unexpected referral error: ', error );
		return; // Not possible.
	}

	const response = error.response;
	let responseBody = JSON.parse( response.text );
	responseBody = 'object' === typeof responseBody ? responseBody : {};
	const eventProps = pick( responseBody, whitelistedEventProps );

	eventProps.status = response.status || '';
	eventProps.success = responseBody.success || '';
	eventProps.description = responseBody.message || 'error';

	analytics.tracks.recordEvent( 'calypso_refer_visit_response', eventProps );
};

registerHandlers( 'state/data-layer/third-party/refer', {
	[ AFFILIATE_REFERRAL ]: [
		dispatchRequestEx( {
			fetch: trackAffiliatePageLoad,
			onSuccess: onTrackAffiliatePageLoadSuccess,
			onError: onTrackAffiliatePageLoadError,
		} ),
	],
} );
