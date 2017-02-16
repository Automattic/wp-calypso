/**
 * External dependencies
 */
import { sortBy, toPairs, head } from 'lodash';

/**
 * Internal dependencies
 */
import { processHttpRequest } from './utils';

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

const inflightRequests = new Set();

/** We care about handling two cases of inbound http requests here
* 1. new request not inflight: add it to the inflight set and pass-through unharmed
* 2. new request already inflight: do not let the request through
*/
function handleIngress( store, next, action ) {
	const key = buildKey( action );
	if ( inflightRequests.has( key ) ) {
		return; // action should not pass go, should not collect $200
	}
	inflightRequests.add( key );
	next( action );
}

function handleEgress( store, next, action ) {
	const key = buildKey( action );
	inflightRequests.delete( key );
	next( action );
}

export default processHttpRequest(
	handleIngress,
	handleEgress,
);
