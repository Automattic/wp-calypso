import {
	STATS_MODULE_SETTINGS_REQUEST,
	STATS_MODULE_SETTINGS_RECEIVE,
	STATS_MODULE_SETTINGS_UPDATE,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/stats/module-settings';
import 'calypso/state/stats/init';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve stats module settings data.
 * @param  {number}  siteId Site ID
 * @returns {Object}  Action object
 */

export function requestModuleSettings( siteId: number ) {
	return {
		type: STATS_MODULE_SETTINGS_REQUEST,
		siteId,
	};
}

/**
 * Returns an action object to dispatch when module settings data has been received.
 * @param {number} siteId Site ID
 * @param {Object} data   API response
 * @returns {Object}  Action object
 */
export function receiveModuleSettings( siteId: number, data: object ) {
	return {
		type: STATS_MODULE_SETTINGS_RECEIVE,
		siteId,
		data,
	};
}

/**
 * Returns an action object to dispatch a network request to update module settings.
 * @param {number} siteId  Site ID
 * @param {Object} payload settings payload to API enpoint
 * @returns {Object}  Action object
 */
export function updateModuleSettings( siteId: number, payload: object ) {
	return {
		type: STATS_MODULE_SETTINGS_UPDATE,
		siteId,
		payload,
	};
}
