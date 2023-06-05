import {
	STATS_MODULES_SETTINGS_REQUEST,
	STATS_MODULES_SETTINGS_RECEIVE,
	STATS_MODULES_SETTINGS_UPDATE,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/stats/modules-settings';
import 'calypso/state/stats/init';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve stats modules settings data.
 *
 * @param  {number}  siteId Site ID
 * @returns {Object}  Action object
 */

export function requestModulesSettings( siteId: number ) {
	return {
		type: STATS_MODULES_SETTINGS_REQUEST,
		siteId,
	};
}

/**
 * Returns an action object to dispatch when modules settings data has been received.
 *
 * @param {number} siteId Site ID
 * @param {Object} data   API response
 * @returns {Object}  Action object
 */
export function receiveModulesSettings( siteId: number, data: object ) {
	return {
		type: STATS_MODULES_SETTINGS_RECEIVE,
		siteId,
		data,
	};
}

/**
 * Returns an action object to dispatch a network request to update modules settings.
 *
 * @param {number} siteId  Site ID
 * @param {Object} payload settings payload to API enpoint
 * @returns {Object}  Action object
 */
export function updateModulesSettings( siteId: number, payload: object ) {
	return {
		type: STATS_MODULES_SETTINGS_UPDATE,
		siteId,
		payload,
	};
}
