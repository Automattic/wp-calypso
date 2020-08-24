/**
 * Internal dependencies
 */
import config from 'config';
import { loadScript } from '@automattic/load-script';

/**
 * Module variables
 */
const GOOGLE_MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api/js';
const GOOGLE_MAPS_API_KEY = config( 'google_maps_and_places_api_key' );

let geocoder;

function queryGoogleMapsApi( queryParams ) {
	return new Promise( ( resolve, reject ) => {
		if ( geocoder ) {
			return queryGeocoder( queryParams, resolve, reject );
		}

		loadScript( GOOGLE_MAPS_API_BASE_URL + '?key=' + GOOGLE_MAPS_API_KEY, function () {
			// eslint-disable-next-line no-undef
			geocoder = new google.maps.Geocoder();
			return queryGeocoder( queryParams, resolve, reject );
		} );
	} );
}

function queryGeocoder( queryParams, resolve, reject ) {
	geocoder.geocode( queryParams, function ( results, status ) {
		if ( status === 'OK' ) {
			return resolve( results );
		}
		reject( status );
	} );
}

export function geocode( address ) {
	return queryGoogleMapsApi( { address } );
}

export function reverseGeocode( latitude, longitude ) {
	return queryGoogleMapsApi( {
		location: { lat: parseFloat( latitude ), lng: parseFloat( longitude ) },
	} );
}
