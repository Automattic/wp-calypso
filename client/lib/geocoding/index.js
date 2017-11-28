/** @format */

/**
 * External dependencies
 */

import request from 'superagent';

/**
 * Module variables
 */
const GOOGLE_MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

export function geocode( address ) {
	return new Promise( ( resolve, reject ) => {
		request
			.get( GOOGLE_MAPS_API_BASE_URL )
			.query( { address } )
			.end( ( error, response ) => {
				if ( error || ! response.ok || 'OK' !== response.body.status ) {
					return reject( error );
				}

				resolve( response.body.results );
			} );
	} );
}
