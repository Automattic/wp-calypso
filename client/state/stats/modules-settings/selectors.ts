import { get } from 'lodash';

import 'calypso/state/stats/init';

const EMPTY_RESULT = {};

/**
 * Returns modules settings for a given site
 *
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {Object}           Highlights object; see schema.
 */
export function getModulesSettings( state: object, siteId: number, pageName: string ) {
	return get( state, [ 'stats', 'modulesSettings', 'data', siteId, pageName ], EMPTY_RESULT );
}

/**
 * Returns whether or not the modules settings are being loaded
 *
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {boolean}          	 Array of stat types as strings
 */
export function isLoading( state: object, siteId: number ) {
	return get( state, [ 'stats', 'modulesSettings', 'isLoading', siteId ] );
}
