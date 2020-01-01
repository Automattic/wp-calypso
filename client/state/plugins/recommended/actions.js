/**
 * Internal dependencies
 */
import {
	PLUGINS_RECOMMENDED_RECEIVE,
	PLUGINS_RECOMMENDED_REQUEST_FAILURE,
	PLUGINS_RECOMMENDED_REQUEST,
} from 'state/action-types';

import 'state/data-layer/wpcom/sites/plugins/recommended';

/**
 * Returns an action object that's bound to the data layer;
 * fetches a list of recommended plugins for the given siteId.
 *
 * @param  {Number}  siteId  Site ID
 * @param  {Number}  limit   Number of desired plugin recommendations
 * @return {object}          Action object
 */
export function fetchRecommendedPlugins( siteId, limit = 6 ) {
	return { limit, siteId, type: PLUGINS_RECOMMENDED_REQUEST };
}

/**
 * Returns an action object to signal that a list of recommended plugins
 * has been received.
 *
 * @param  {Number}         siteId  Site ID
 * @param  {Array<Object>}  data    List of recommended plugins
 * @return {object}                 Action object
 */
export function receiveRecommendedPlugins( siteId, data ) {
	return { data, siteId, type: PLUGINS_RECOMMENDED_RECEIVE };
}

/**
 * Returns an action object to signal that the network request for
 * recommended plugins has failed.
 *
 * @param  {Number}  siteId  Site ID
 * @return {object}          Action object
 */
export function dispatchRecommendPluginsRequestFailure( siteId ) {
	return { siteId, type: PLUGINS_RECOMMENDED_REQUEST_FAILURE };
}
