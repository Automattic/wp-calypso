/**
 * External dependencies
 */
import {
	compact,
	isEqual,
	unionWith,
} from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:data-layer:remove-duplicate-gets' );

/**
 * Internal dependencies
 */
import {
	buildKey,
	isGetRequest,
} from '../utils';

/**
 * Prevent sending multiple identical GET requests
 * while one is still transiting over the network
 *
 * Two requests are considered identical if they
 * are both GET requests and share the same
 * fundamental properties.
 *
 * @module state/data-layer/wpcom-http/optimizations/remove-duplicate-gets
 */

/** @type {Map} holds in-transit request keys */
const requestQueue = new Map();

/**
 * Empties the duplication queue
 *
 * FOR TESTING ONLY!
 */
export const clearQueue = () => {
	if ( 'undefined' !== typeof window ) {
		throw new Error( '`clearQueue()` is not for use in production - only in testing!' );
	}

	requestQueue.clear();
};

/**
 * Joins a responder action into a unique list of responder actions
 *
 * @param {Object<String, Object[]>} list existing responder actions
 * @param {Object} item new responder action to add
 * @returns {Object<String, Object[]>} union of existing list and new item
 */
export const addResponder = ( list, item ) => ( {
	failures: unionWith( list.failures, compact( [ item.onFailure ] ), isEqual ),
	successes: unionWith( list.successes, compact( [ item.onSuccess ] ), isEqual ),
} );

/**
 * Prevents sending duplicate requests when one is
 * already in transit over the network.
 *
 * @see applyDuplicateHandlers
 *
 * @param {OutboundData} outboundData request info
 * @returns {OutboundData} filtered request info
 */
export const removeDuplicateGets = outboundData => {
	const { nextRequest } = outboundData;

	if ( ! isGetRequest( nextRequest ) ) {
		return outboundData;
	}

	const key = buildKey( nextRequest );
	const queued = requestQueue.get( key );
	const request = addResponder( queued || { failures: [], successes: [] }, nextRequest );

	requestQueue.set( key, request );

	return queued
		? { ...outboundData, nextRequest: null }
		: outboundData;
};

/**
 * When requests have been de-duplicated and return
 * this injects the other responder actions into the
 * response stream so that each caller gets called
 *
 * @see removeDuplicateGets
 *
 * @param {InboundData} inboundData request info
 * @returns {InboundData} processed request info
 */
export const applyDuplicatesHandlers = inboundData => {
	const { originalRequest } = inboundData;

	if ( ! isGetRequest( originalRequest ) ) {
		return inboundData;
	}

	const key = buildKey( originalRequest );
	const queued = requestQueue.get( key );

	if ( ! queued ) {
		debug(
			'applyDuplicatesHandler has entered an impossible state!' +
			'A HTTP request is exiting the http pipeline without having entered it.' +
			'There must be a bug somewhere'
		);
		return inboundData;
	}

	requestQueue.delete( key );

	const responders = {
		failures: unionWith( inboundData.failures || [], queued.failures, isEqual ),
		successes: unionWith( inboundData.successes || [], queued.successes, isEqual ),
	};

	return { ...inboundData, ...responders };
};
