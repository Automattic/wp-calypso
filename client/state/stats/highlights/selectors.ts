import { get } from 'lodash';

import 'calypso/state/stats/init';

const EMPTY_RESULT = {};

/**
 * Returns highlights values for a given site
 *
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {object}           Highlights object; see schema.
 */
export function getHighlights( state: object, siteId: number ) {
	return get( state, [ 'stats', 'highlights', 'data', siteId ], EMPTY_RESULT );
}

/**
 * Returns whether or not the highlights are being loaded
 *
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {boolean}          	 Array of stat types as strings
 */
export function isLoading( state: object, siteId: number ) {
	return get( state, [ 'stats', 'highlights', 'isLoading', siteId ] );
}
