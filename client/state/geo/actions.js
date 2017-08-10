/** @format */
/**
 * Internal dependencies
 */
import request from 'superagent';
import {
	GEO_RECEIVE,
	GEO_REQUEST,
	GEO_REQUEST_FAILURE,
	GEO_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Constants
 */
export const GEO_ENDPOINT = 'https://public-api.wordpress.com/geo/';

/**
 * Returns an action object used in signalling that the current browser IP
 * geolocation has been received.
 *
 * @param  {Object} geo Geolocation data
 * @return {Object}     Action object
 */
export function receiveGeo( geo ) {
	return {
		type: GEO_RECEIVE,
		geo,
	};
}

/**
 * Returns a function which, when invoked, triggers a network request to fetch
 * browser IP geolocation.
 *
 * @return {Function} Action thunk
 */
export function requestGeo() {
	return dispatch => {
		dispatch( { type: GEO_REQUEST } );

		return request
			.get( GEO_ENDPOINT )
			.then( ( { body: geo } ) => {
				dispatch( { type: GEO_REQUEST_SUCCESS } );
				dispatch( receiveGeo( geo ) );
			} )
			.catch( error => {
				dispatch( {
					type: GEO_REQUEST_FAILURE,
					error,
				} );
			} );
	};
}
