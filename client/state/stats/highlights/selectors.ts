import { get } from 'lodash';

import 'calypso/state/stats/init';

const EMPTY_RESULT = {};

/**
 * Returns highlights values for a given site
 *
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {Object}           Highlights object; see schema.
 */
export function getHighlights( state: object, siteId: number ) {
	return get( state, [ 'stats', 'highlights', 'data', siteId ], EMPTY_RESULT );
}

/**
 * Returns whether or not the highlights are being loaded
 *
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {boolean}          	 Array of stat types as strings
 */
export function isLoading( state: object, siteId: number ) {
	return get( state, [ 'stats', 'highlights', 'isLoading', siteId ] );
}
