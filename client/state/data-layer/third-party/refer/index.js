/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { registerHandlers } from 'state/data-layer/handler-registry';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/http/actions';
import { AFFILIATE_REFERRAL } from 'state/action-types';

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

registerHandlers( 'state/data-layer/third-party/refer', {
	[ AFFILIATE_REFERRAL ]: [
		dispatchRequestEx( {
			fetch: trackAffiliatePageLoad,
			onSuccess: noop,
			onError: noop,
		} ),
	],
} );
