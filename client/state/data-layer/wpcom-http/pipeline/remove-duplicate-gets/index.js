/**
 * External dependencies
 */
import {
	compact,
	head,
	isEqual,
	pick,
	sortBy,
	toPairs,
	unionBy,
} from 'lodash';

/**
 * Prevent sending multiple identical GET requests
 * while one is still transiting over the network
 *
 * Note! This doesn't do anything yet
 *
 * @module state/data-layer/wpcom-http/optimizations/remove-duplicate-gets
 */

const requestQueue = new Map();

export const buildKey = ( { path, apiVersion, query } ) => JSON.stringify( [
	path,
	apiVersion,
	sortBy( toPairs( query ), head ),
] );

export const addResponder = ( list, item ) => ( {
	failures: unionBy( list.failures, compact( [ item.onFailure ] ), isEqual ),
	successes: unionBy( list.successes, compact( [ item.onSuccess ] ), isEqual ),
} );

/**
 * @type IngressProcessor
 * @param {IngressData} ingressData
 * @returns {IngressData}
 */
export const removeDuplicateGets = ingressData => {
	const { nextAction: action } = ingressData;
	const key = buildKey( action );
	const queued = requestQueue.get( key ) || { failures: [], successes: [] };
	const request = addResponder( queued, action );

	requestQueue.set( key, request );

	return queued
		? { ...ingressData, nextAction: null }
		: ingressData;
};

/**
 * @type EgressProcessor
 */
export const applyDuplicatesHandlers = egressData => {
	const { originalAction: action } = egressData;
	const key = buildKey( action );
	const queued = requestQueue.delete( key );

	return queued
		? { ...egressData, ...pick( queued, [ 'failures', 'successes' ] ) }
		: egressData;
};
