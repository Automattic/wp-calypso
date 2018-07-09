/** @format */

/**
 * External dependencies
 */

import { loadScript } from 'lib/load-script';

/**
+ * Internal dependencies
+ */
import config from 'config';

/**
 * Module variables
 */
const GOOGLE_MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api/js';
const GOOGLE_MAPS_API_KEY = config( 'google_maps_and_places_api_key' );

let geocoder;

function queryGoogleMapsApi( queryParams ) {
	console.log( 'called queryGoogleMapsApi' );
	return new Promise( ( resolve, reject ) => {
		if ( geocoder ) {
			console.log( 'Howdy!' );
			return queryGeocoder( queryParams, resolve, reject );
		}

		loadScript( GOOGLE_MAPS_API_BASE_URL + '?key=' + GOOGLE_MAPS_API_KEY, function() {
			console.log( 'load script' );
			// eslint-disable-next-line no-undef
			geocoder = new google.maps.Geocoder();
			return queryGeocoder( queryParams, resolve, reject );
		} );
	} );
}

function queryGeocoder( queryParams, resolve, reject ) {
	console.log( 'queryGeocoder', queryParams );
	geocoder.geocode( queryParams, function( results, status ) {
		if ( status === 'OK' ) {
			console.log( 'WORKED', results, status );
			return resolve( results );
		}
		console.log( 'FAILED', results, status );
		reject( status );
	} );
}

export function geocode( address ) {
	return queryGoogleMapsApi( { address } );
}

export function reverseGeocode( latitude, longitude ) {
	return queryGoogleMapsApi( { location: { lat: latitude, lng: longitude } } );
}
