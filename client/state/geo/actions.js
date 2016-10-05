/**
 * Internal dependencies
 */
import request from 'superagent';
import {
	GEO_RECEIVE,
	GEO_REQUEST,
	GEO_REQUEST_FAILURE,
	GEO_REQUEST_SUCCESS
} from 'state/action-types';

/**
 * Constants
 */
export const GEO_ENDPOINT = 'https://public-api.wordpress.com/geo/';

export function receiveGeo( geo ) {
	return {
		type: GEO_RECEIVE,
		geo
	};
}

export function requestGeo() {
	return ( dispatch ) => {
		dispatch( { type: GEO_REQUEST } );

		return request.get( GEO_ENDPOINT ).then( ( { body: geo } ) => {
			dispatch( { type: GEO_REQUEST_SUCCESS } );
			dispatch( receiveGeo( geo ) );
		} ).catch( ( error ) => {
			dispatch( {
				type: GEO_REQUEST_FAILURE,
				error
			} );
		} );
	};
}
