import type { AppState } from 'calypso/types';
import 'calypso/state/stats/init';

const EMPTY_RESULT = {};

/**
 * Returns module toggles for a given site
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {Object}           Highlights object; see schema.
 */
export function getModuleToggles( state: AppState, siteId: number, pageName: string ) {
	return state?.stats?.moduleToggles?.data?.[ siteId ]?.[ pageName ] ?? EMPTY_RESULT;
}

/**
 * Returns whether or not the module toggles are being loaded
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {boolean}          	 Array of stat types as strings
 */
export function isLoading( state: AppState, siteId: number ) {
	return state?.stats?.moduleToggles?.isLoading?.[ siteId ];
}
