/** @format */
/**
 * Internal dependencies
 */
import { PLUGINS_RECOMMENDED_REQUEST, PLUGINS_RECOMMENDED_RECEIVE } from 'state/action-types';

import 'state/data-layer/wpcom/sites/plugins/recommended';

/**
 * Returns an action object that's bound to the data layer;
 * fetches a list of recommended plugins for the given siteId.
 *
 * @param  {Number}  siteId        Site ID
 * @param  {Number}  limit         Number of desired plugin recommendations
 * @return {Object}  Action object
 */
export function fetchRecommendedPlugins( siteId, limit = 6 ) {
	return {
		limit,
		siteId,
		type: PLUGINS_RECOMMENDED_REQUEST,
	};
}

/**
 * Returns an action object to signal that a list of recommended plugins
 * has been received.
 *
 * @param  {Number}  siteId         Site ID
 * @param  {Array<Object>}  data    List of recommended plugins
 * @return {Object}  Action object
 */
export function receiveRecommendedPlugins( siteId, data ) {
	return {
		data,
		siteId,
		type: PLUGINS_RECOMMENDED_RECEIVE,
	};
}
