/**
 * External dependencies
 */
import { get } from 'lodash';

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
	return get( state.shortcodes.requesting, [ siteId, shortcode ], false );
};

/**
 * Retrieve the data of a certain shortcode for a particular site
 * @param  {Object} state      Global state tree
 * @param  {Number} siteId     Site ID
 * @param  {String} shortcode  Shortcode
 * @return {Object}            Shortcode data
 */
export const getShortcode = ( state, siteId, shortcode ) => {
	return get( state.shortcodes.items, [ siteId, shortcode ] );
};
