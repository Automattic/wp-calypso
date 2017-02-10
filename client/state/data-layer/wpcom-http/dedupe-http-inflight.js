/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { WPCOM_HTTP_REQUEST } from 'state/action-types';

import { errorMeta, successMeta } from './';
export const requestKey = ( { path, query } ) => Object
	.keys( query || {} )
	.sort()
	.reduce( ( memo, key ) => memo + `&${ key }=${ query[ key ] }`, `path=${ path }` );

const inflightRequests = new Set();

// is this a preprocess
const requestStart = action => action.type === WPCOM_HTTP_REQUEST;
const requestEnd = action => errorMeta( action ) || successMeta( action );

const dedupeInflightHttpRequests = () => next => action => {
	const isRequestStart = requestStart( action );
	const isRequestEnd = requestEnd( action );

	// unrelated to http dedupe middleware. we only care to dedupe GETs
	if (
			! isRequestStart &&
			! isRequestEnd ||
			! action.method.toUpperCase() !== 'GET' ) {
		next( action );
		return;
	}

	/** We care about handling three cases of requests in this middleware
	 * 1. new request not inflight: add it to the inflight set and pass-through unharmed
	 * 2. new request already inflight: do not let the request through
	 * 3. request ending: remove it from inflight set
	 */
	const key = requestKey( action );
	if ( isRequestStart && inflightRequests.has( key ) ) {
		return; // action should not pass go, should not collect $200
	} else if ( isRequestStart ) {
		inflightRequests.add( key );
		next( action );
	} else if ( requestEnd ) {
		inflightRequests.delete( key );
		next( action );
	}
};

export default dedupeInflightHttpRequests;
