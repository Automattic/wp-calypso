/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns whether a browser IP geolocation request is in progress.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether request is in progress
 */
export function isRequestingGeo( state ) {
	return state.geo.requesting;
}

/**
 * Returns the current browser IP geolocation data.
 *
 * @param  {Object}  state Global state tree
 * @return {?Object}       Current browser IP geolocation data
 */
export function getGeo( state ) {
	return state.geo.geo;
}

/**
 * Returns the current browser IP geolocation full country name.
 *
 * @param  {Object}  state Global state tree
 * @param  {String}  type  Form of return value
 * @return {?String}       Current browser IP geolocation data
 */
export function getGeoCountry( state, type = 'long' ) {
	if ( 'long' !== type && 'short' !== type ) {
		type = 'long';
	}
	return get( getGeo( state ), 'country_' + type, null );
}
