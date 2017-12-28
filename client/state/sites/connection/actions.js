/** @format */

/**
 * Internal dependencies
 */

import {
	SITE_CONNECTION_STATUS_RECEIVE,
	SITE_CONNECTION_STATUS_REQUEST,
	SITE_CONNECTION_STATUS_REQUEST_FAILURE,
	SITE_CONNECTION_STATUS_REQUEST_SUCCESS,
} from 'client/state/action-types';
import wp from 'client/lib/wp';

/**
 * Request the Jetpack connection status for a certain site.
 *
 * @param  {Int}       siteId  ID of the site.
 * @return {Function}          Action thunk to request the Jetpack connection status when called.
 */
export const requestConnectionStatus = siteId => {
	return dispatch => {
		dispatch( {
			type: SITE_CONNECTION_STATUS_REQUEST,
			siteId,
		} );

		return wp
			.undocumented()
			.testConnectionJetpack( siteId )
			.then( response => {
				dispatch( {
					type: SITE_CONNECTION_STATUS_RECEIVE,
					siteId,
					status: response.connected,
				} );

				dispatch( {
					type: SITE_CONNECTION_STATUS_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: SITE_CONNECTION_STATUS_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
};
