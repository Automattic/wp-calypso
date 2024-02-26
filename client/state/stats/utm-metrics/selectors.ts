import { get } from 'lodash';
import 'calypso/state/stats/init';
import { UTMMetricItem } from 'calypso/state/stats/utm-metrics/types';

const EMPTY_RESULT = [] as UTMMetricItem[];

/**
 * Returns UTM metrics for a given site
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {Object}           Highlights object; see schema.
 */
export function getMetrics( state: object, siteId: number ) {
	return get( state, [ 'stats', 'utmMetrics', 'data', siteId ], EMPTY_RESULT );
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
