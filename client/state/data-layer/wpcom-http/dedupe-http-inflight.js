/**
 * External dependencies
 */
import {
	sortBy,
	toPairs,
	head,
	get,
	compact,
	uniqBy,
	isEqual,
} from 'lodash';

/**
 * Internal dependencies
 */
import {
	processHttpRequest,
	getError,
	getData,
 } from './utils';

import { failureMeta, successMeta } from './index';
import { extendAction } from 'state/utils';

/**
 * Prevent sending multiple identical GET requests
 * while one is still transiting over the network
 *
 * Two requests are considered identical if they
 * are both GET requests and share the same path,query,apiVersion, apiNamespace
 *
 * @module state/data-layer/wpcom-http/optimizations/remove-duplicate-gets
 */

/** @type {Map} holds in-transit request keys + the associated onSuccess/onError actions */
const requestMap = new Map();

/**
 * Generate a deterministic key for comparing request descriptions
 *
 * @param {String} path API endpoint path
 * @param {String} apiNamespace used for endpoint versioning
 * @param {String} apiVersion used for endpoint versioning
 * @param {Object<String, *>} query GET query string
 * @returns {String} unique key up to duplicate request descriptions
 */
export const buildKey = ( { path, apiNamespace, apiVersion, query } ) => JSON.stringify( [
	path,
	apiNamespace,
	apiVersion,
	sortBy( toPairs( query ), head ),
] );

/**
 * Determines if a request object specifies the GET HTTP method
 *
 * @param {Object} request the HTTP request action
 * @returns {Boolean} whether or not the method is GET
 */
const isGetRequest = request => 'GET' === get( request, 'method', '' ).toUpperCase();

/**
 * Places all of the inflight requests into a map of of:
 * 	{ requestKey: { successActions: [], failureActions: [] } }.
 *
 * If it sees that a requestKey is already in flight, then it drops the action
 * and adds its success/failure actions to the map.
 *
 * @param  {Object}   store  Redux store
 * @param  {Function} next   Redux middleware next
 * @param  {Object}   action Redux action
 */
export function handleIngress( store, next, action ) {
	if ( ! isGetRequest( action ) ) {
		next( action );
		return;
	}

	const key = buildKey( action );
	const request = requestMap.get( key );

	if ( request ) {
		request.successActions.push( action.onSuccess );
		request.errorActions.push( action.onError );
	} else {
		requestMap.set( key, {
			successActions: [ action.onSuccess ],
			errorActions: [ action.onError ],
		} );
		next( action );
	}
}

/**
 * Does a deep uniqify and removes nulls for any list
 * @param  {Array} list
 */
export const deepUnique = list => compact( uniqBy( list, isEqual ) );

/**
 * Takes any completed that was placed into the requestMap and
 * sends out all of its associated onSuccess/onFailure actions;
 *
 * @param  {Object}   store  Redux store
 * @param  {Function} next   Redux middleware next
 * @param  {Object}   action Redux action
 */
export function handleEgress( store, next, action ) {
	const key = buildKey( action );
	const request = requestMap( key );

	if ( ! request ) {
		next( action );
		return;
	}

	const successActions = deepUnique( request.successActions );
	const errorActions = deepUnique( request.errorActions );

	const error = getError( action );
	const data = getData( action );
	if ( error ) {
		errorActions.forEach( axn => next( extendAction( axn, failureMeta( error ) ) ) );
	} else if ( data ) {
		successActions.forEach( axn => next( extendAction( axn, successMeta( data ) ) ) );
	}

	requestMap.delete( key );
}

export default processHttpRequest(
	handleIngress,
	handleEgress,
);

// TODO add tests. this is probably broken
