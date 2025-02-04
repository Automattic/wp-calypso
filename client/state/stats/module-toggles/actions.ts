import {
	STATS_MODULE_TOGGLES_REQUEST,
	STATS_MODULE_TOGGLES_RECEIVE,
	STATS_MODULE_TOGGLES_UPDATE,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/stats/module-toggles';
import 'calypso/state/stats/init';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve stats module toggles data.
 * @param  {number}  siteId Site ID
 * @returns {Object}  Action object
 */

export function requestModuleToggles( siteId: number ) {
	return {
		type: STATS_MODULE_TOGGLES_REQUEST,
		siteId,
	};
}

/**
 * Returns an action object to dispatch when module toggles data has been received.
 * @param {number} siteId Site ID
 * @param {Object} data   API response
 * @returns {Object}  Action object
 */
export function receiveModuleToggles( siteId: number, data: object ) {
	return {
		type: STATS_MODULE_TOGGLES_RECEIVE,
		siteId,
		data,
	};
}

/**
 * Returns an action object to dispatch a network request to update module toggles.
 * @param {number} siteId  Site ID
 * @param {Object} payload settings payload to API enpoint
 * @returns {Object}  Action object
 */
export function updateModuleToggles( siteId: number, payload: object ) {
	return {
		type: STATS_MODULE_TOGGLES_UPDATE,
		siteId,
		payload,
	};
}
