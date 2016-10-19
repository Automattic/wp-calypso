/**
 * External dependencies
 */
import { has } from 'lodash';

/**
 * Returns true if currently requesting that shortcode for the specified site ID, or
 * false otherwise.
 *
 * @param  {Object}  state     Global state tree
 * @param  {Number}  siteId    Site ID
 * @param  {String}  shortcode Shortcode
 * @return {Boolean}           Whether that shortcode is being requested
 */
export const isRequestingShortcode = ( state, siteId, shortcode ) => {
	if ( ! has( state, [ 'shortcodes', 'requesting', siteId, shortcode ] ) ) {
		return false;
	}

	return !! state.shortcodes.requesting[ siteId ][ shortcode ];
};

/**
 * Retrieve the data of a certain shortcode for a particular site
 * @param  {Object} state      Global state tree
 * @param  {Number} siteId     Site ID
 * @param  {String} shortcode  Shortcode
 * @return {Object}            Shortcode data
 */
export const getShortcode = ( state, siteId, shortcode ) => {
	if ( ! has( state, [ 'shortcodes', 'items', siteId, shortcode ] ) ) {
		return;
	}

	return state.shortcodes.items[ siteId ][ shortcode ];
};
