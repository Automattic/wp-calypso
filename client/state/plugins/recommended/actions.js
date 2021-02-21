/**
 * Internal dependencies
 */
import {
	PLUGINS_RECOMMENDED_RECEIVE,
	PLUGINS_RECOMMENDED_REQUEST_FAILURE,
	PLUGINS_RECOMMENDED_REQUEST,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/plugins/recommended';
import 'calypso/state/plugins/init';

/**
 * Returns an action object that's bound to the data layer;
 * fetches a list of recommended plugins for the given siteId.
 *
 * @param  {number}  siteId  Site ID
 * @param  {number}  limit   Number of desired plugin recommendations
 * @returns {object}          Action object
 */
export function fetchRecommendedPlugins( siteId, limit = 6 ) {
	return { limit, siteId, type: PLUGINS_RECOMMENDED_REQUEST };
}

/**
 * Returns an action object to signal that a list of recommended plugins
 * has been received.
 *
 * @param  {number}         siteId  Site ID
 * @param  {Array<object>}  data    List of recommended plugins
 * @returns {object}                 Action object
 */
export function receiveRecommendedPlugins( siteId, data ) {
	return { data, siteId, type: PLUGINS_RECOMMENDED_RECEIVE };
}

/**
 * Returns an action object to signal that the network request for
 * recommended plugins has failed.
 *
 * @param  {number}  siteId  Site ID
 * @returns {object}          Action object
 */
export function dispatchRecommendPluginsRequestFailure( siteId ) {
	return { siteId, type: PLUGINS_RECOMMENDED_REQUEST_FAILURE };
}
