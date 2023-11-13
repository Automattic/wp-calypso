import { get } from 'lodash';

import 'calypso/state/stats/init';

const EMPTY_RESULT = {};

/**
 * Returns module toggles for a given site
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {Object}           Highlights object; see schema.
 */
export function getModuleToggles( state: object, siteId: number, pageName: string ) {
	return get( state, [ 'stats', 'moduleToggles', 'data', siteId, pageName ], EMPTY_RESULT );
}

/**
 * Returns whether or not the module toggles are being loaded
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {boolean}          	 Array of stat types as strings
 */
export function isLoading( state: object, siteId: number ) {
	return get( state, [ 'stats', 'moduleToggles', 'isLoading', siteId ] );
}
