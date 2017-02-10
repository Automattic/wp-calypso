/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { processHttpRequest } from './utils';

export const requestKey = ( { path, query } ) => Object
	.keys( query || {} )
	.sort()
	.reduce( ( memo, key ) => memo + `&${ key }=${ query[ key ] }`, `path=${ path }` );

const inflightRequests = new Set();

/** We care about handling two cases of inbound http requests here
* 1. new request not inflight: add it to the inflight set and pass-through unharmed
* 2. new request already inflight: do not let the request through
*/
function handleInbound( store, next, action ) {
	const key = requestKey( action );
	if ( inflightRequests.has( key ) ) {
		return; // action should not pass go, should not collect $200
	}
	inflightRequests.add( key );
	next( action );
}

function handleOutbound( store, next, action ) {
	const key = requestKey( action );
	inflightRequests.delete( key );
	next( action );
}

export default processHttpRequest(
	handleInbound,
	handleOutbound,
);
