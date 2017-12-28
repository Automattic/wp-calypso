/** @format */

/**
 * External dependencies
 */

import debug from 'debug';
import noop from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'client/state/http/actions';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';

const aDebug = debug( 'calypso:analytics:affiliate' );

import { AFFILIATE_REFERRAL } from 'client/state/action-types';

const trackAffiliatePageLoad = ( { dispatch }, action ) => {
	const { affiliateId, urlPath } = action;

	if ( ! affiliateId || isNaN( affiliateId ) ) {
		return;
	}

	aDebug( 'affiliate referrer request', action );

	dispatch(
		http(
			{
				method: 'POST',
				url: 'https://refer.wordpress.com/clicks/67402',
				headers: [ [ 'content-type', 'application/x-www-form-urlencoded; charset=UTF-8' ] ],
				body: {
					affiliate_id: affiliateId,
					referrer: urlPath,
				},
				// Needed to check and set the 'wp-affiliate-tracker' cookie
				withCredentials: true,
			},
			action
		)
	);
};

const trackAffiliatePageLoadSuccess = ( { dispatch }, action, rData ) => {
	aDebug( 'affiliate referrer request successful', rData );
};

export default {
	[ AFFILIATE_REFERRAL ]: [
		dispatchRequest( trackAffiliatePageLoad, trackAffiliatePageLoadSuccess, noop ),
	],
};
