/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/shortcodes/init';

/**
 * Returns true if currently requesting that shortcode for the specified site ID, or
 * false otherwise.
 *
 * @param  {object}  state     Global state tree
 * @param  {number}  siteId    Site ID
 * @param  {string}  shortcode Shortcode
 * @returns {boolean}           Whether that shortcode is being requested
 */
export const isRequestingShortcode = ( state, siteId, shortcode ) => {
	return get( state.shortcodes.requesting, [ siteId, shortcode ], false );
};

/**
 * Retrieve the data of a certain shortcode for a particular site
 *
 * @param  {object} state      Global state tree
 * @param  {number} siteId     Site ID
 * @param  {string} shortcode  Shortcode
 * @returns {object}            Shortcode data
 */
export const getShortcode = ( state, siteId, shortcode ) => {
	return get( state.shortcodes.items, [ siteId, shortcode ] );
};
