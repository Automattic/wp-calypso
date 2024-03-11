import { get } from 'lodash';
import { UTMMetricItem } from './types';
import 'calypso/state/stats/init';

const EMPTY_RESULT = [] as Array< UTMMetricItem >;

/**
 * Returns UTM metrics for a given site
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {Object}           Highlights object; see schema.
 */
export function getMetrics( state: object, siteId: number, postId?: number ) {
	const metrics = postId
		? get( state, [ 'stats', 'utmMetrics', 'data', siteId, 'metricsByPost', postId ], EMPTY_RESULT )
		: get( state, [ 'stats', 'utmMetrics', 'data', siteId, 'metrics' ], EMPTY_RESULT );

	return metrics;
}

export function getTopPosts( state: object, siteId: number ) {
	return get( state, [ 'stats', 'utmMetrics', 'data', siteId, 'topPosts' ], {} );
}

/**
 * Returns whether or not the UTM metrics are being loaded
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {boolean}          	 Array of stat types as strings
 */
export function isLoading( state: object, siteId: number ) {
	return get( state, [ 'stats', 'utmMetrics', 'isLoading', siteId ] );
}
