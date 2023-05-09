import debugFactory from 'debug';
import { compact, get, isEqual, sortBy } from 'lodash';
const debug = debugFactory( 'calypso:data-layer:remove-duplicate-gets' );

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
 * Determines if a request object specifies the GET HTTP method
 *
 * @param {Object} request the HTTP request action
 * @returns {boolean} whether or not the method is GET
 */
const isGetRequest = ( request ) => 'GET' === get( request, 'method', '' ).toUpperCase();

/**
 * Returns all elements that exist in any of the two arrays at least once,
 *
 * @param {Array} a First array
 * @param {Array} b Second array
 * @returns {Array} Array of elements that exist in at least one of the arrays
 */
const unionWith = ( a = [], b = [] ) => [
	...a,
	...b.filter( ( x ) => a.findIndex( ( y ) => isEqual( x, y ) ) === -1 ),
];

/**
 * Generate a deterministic key for comparing request descriptions
 *
 * @param {Object}            requestOptions              Request options
 * @param {string}            requestOptions.path         API endpoint path
 * @param {string}            requestOptions.apiNamespace used for endpoint versioning
 * @param {string}            requestOptions.apiVersion   used for endpoint versioning
 * @param {Object<string, *>} requestOptions.query        GET query string
 * @returns {string} unique key up to duplicate request descriptions
 */
export const buildKey = ( { path, apiNamespace, apiVersion, query = {} } ) =>
	JSON.stringify( [
		path,
		apiNamespace,
		apiVersion,
		sortBy( Object.entries( query ), ( q ) => q[ 0 ] ),
	] );

/**
 * Joins a responder action into a unique list of responder actions
 *
 * @param {Object<string, Object[]>} list existing responder actions
 * @param {Object} item new responder action to add
 * @returns {Object<string, Object[]>} union of existing list and new item
 */
export const addResponder = ( list, item ) => ( {
	failures: unionWith( list.failures, compact( [ item.onFailure ] ) ),
	successes: unionWith( list.successes, compact( [ item.onSuccess ] ) ),
} );

/**
 * Prevents sending duplicate requests when one is
 * already in transit over the network.
 *
 * @see applyDuplicateHandlers
 * @param {Object} outboundData request info
 * @returns {Object} filtered request info
 */
export const removeDuplicateGets = ( outboundData ) => {
	const { nextRequest } = outboundData;

	if ( ! isGetRequest( nextRequest ) ) {
		return outboundData;
	}

	// don't block automatic retries
	if ( get( nextRequest, 'meta.dataLayer.retryCount', 0 ) > 0 ) {
		return outboundData;
	}

	const key = buildKey( nextRequest );
	const queued = requestQueue.get( key );
	const request = addResponder( queued || { failures: [], successes: [] }, nextRequest );

	requestQueue.set( key, request );

	return queued ? { ...outboundData, nextRequest: null } : outboundData;
};

/**
 * When requests have been de-duplicated and return
 * this injects the other responder actions into the
 * response stream so that each caller gets called
 *
 * @see removeDuplicateGets
 * @param {Object} inboundData request info
 * @returns {Object} processed request info
 */
export const applyDuplicatesHandlers = ( inboundData ) => {
	const { originalRequest } = inboundData;

	if ( ! isGetRequest( originalRequest ) ) {
		return inboundData;
	}

	const key = buildKey( originalRequest );
	const queued = requestQueue.get( key );

	if ( ! queued ) {
		debug(
			'applyDuplicatesHandler has entered an impossible state! ' +
				'A HTTP request is exiting the http pipeline without having entered it. ' +
				'There must be a bug somewhere'
		);
		return inboundData;
	}

	requestQueue.delete( key );

	const responders = {
		failures: unionWith( inboundData.failures || [], queued.failures ),
		successes: unionWith( inboundData.successes || [], queued.successes ),
	};

	return { ...inboundData, ...responders };
};
