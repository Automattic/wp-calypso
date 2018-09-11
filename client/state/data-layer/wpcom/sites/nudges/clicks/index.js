/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { SITE_NUDGE_CLICK_REQUEST } from 'state/action-types';
import { nudgeClickReceive } from 'state/sites/nudge-click/actions';

/**
 * Issue the HTTP request to to notify the backend that a nudge was clicked.
 */
export const fetch = action =>
	// TODO: Only make request if it hasn't happened before (isn't in state)
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.payload.siteId }/nudge/click`,
			body: { nudge_name: action.payload.nudgeName },
		},
		action
	);

export const onSuccess = ( action, response ) => {
	console.log( '******* in onSuccess' );
	nudgeClickReceive( response );
};

export default {
	[ SITE_NUDGE_CLICK_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError: noop,
		} ),
	],
};
