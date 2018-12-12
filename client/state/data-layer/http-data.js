/** @format */
/**
 * Internal dependencies
 */
import { HTTP_DATA_REQUEST, HTTP_DATA_TICK } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

export const httpData = new Map();
export const listeners = new Set();

export const empty = Object.freeze( {
	state: 'uninitialized',
	data: undefined,
	error: undefined,
	lastUpdated: -Infinity,
	pendingSince: undefined,
} );

export const getHttpData = id => httpData.get( id ) || empty;

export const subscribe = f => {
	listeners.add( f );

	return () => listeners.delete( f );
};

export const updateData = ( id, state, data ) => {
	const lastUpdated = Date.now();
	const item = httpData.get( id );
	const hasItem = item !== undefined;

	// We could have left out the keys for
	// the previous properties if they didn't
	// exist but I wanted to make sure we can
	// get our hidden classes to optimize here.
	switch ( state ) {
		case 'failure':
			return httpData.set( id, {
				state,
				data: hasItem ? item.data : undefined,
				error: data,
				lastUpdated: hasItem ? item.lastUpdated : -Infinity,
				pendingSince: undefined,
			} );

		case 'pending':
			return httpData.set( id, {
				state,
				data: hasItem ? item.data : undefined,
				error: undefined,
				lastUpdated: hasItem ? item.lastUpdated : -Infinity,
				pendingSince: lastUpdated,
			} );

		case 'success':
			return httpData.set( id, {
				state,
				data,
				error: undefined,
				lastUpdated,
				pendingSince: undefined,
			} );
	}
};

export const update = ( id, state, data ) => {
	const updated = updateData( id, state, data );

	listeners.forEach( f => f() );

	return updated;
};

const fetch = action => {
	update( action.id, 'pending' );

	return [
		{
			...action.fetch,
			onSuccess: action,
			onFailure: action,
			onProgress: action,
		},
		{ type: HTTP_DATA_TICK },
	];
};

const onError = ( action, error ) => {
	update( action.id, 'failure', error );

	return { type: HTTP_DATA_TICK };
};

/**
 * Transforms API response data into storable data
 * Returns pairs of data ids and data plus an error indicator
 *
 * [ error?, [ [ id, data ], [ id, data ], … ] ]
 *
 * @example:
 *   --input--
 *   { data: { sites: {
 *     14: { is_active: true, name: 'foo' },
 *     19: { is_active: false, name: 'bar' }
 *   } } }
 *
 *   --output--
 *   [ [ 'site-names-14', 'foo' ] ]
 *
 * @param {*} data input data from API response
 * @param {function} fromApi transforms API response data
 * @return {Array<boolean, Array<Array<string, *>>>} output data to store
 */
const parseResponse = ( data, fromApi ) => {
	try {
		return [ undefined, fromApi( data ) ];
	} catch ( error ) {
		return [ error, undefined ];
	}
};

const onSuccess = ( action, apiData ) => {
	const fromApi = 'function' === typeof action.fromApi && action.fromApi();
	const [ error, data ] = fromApi ? parseResponse( apiData, fromApi ) : [ undefined, [] ];

	if ( undefined !== error ) {
		return onError( action, error );
	}

	update( action.id, 'success', apiData );
	data.forEach( ( [ id, resource ] ) => update( id, 'success', resource ) );

	return { type: HTTP_DATA_TICK };
};

export default {
	[ HTTP_DATA_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
};

export const reducer = ( state = 0, { type } ) => ( HTTP_DATA_TICK === type ? state + 1 : state );

let dispatch;
let dispatchQueue = [];

export const enhancer = next => ( ...args ) => {
	const store = next( ...args );

	dispatch = store.dispatch;

	// allow rest of enhancers and middleware
	// to load then dispatch all queued actions
	// delay picked to allow for initialization
	// to occur while remaining "instant"
	setTimeout( () => {
		dispatchQueue.forEach( dispatch );
		dispatchQueue = [];
	}, 50 );

	return store;
};

/**
 * Fetches data from a fetchable action
 *
 * @param {string} requestId uniquely identifies the request or request type
 * @param {function|object} fetchAction action that when dispatched will request the data (may be wrapped in a lazy thunk)
 * @param {?function} fromApi when called produces a function that validates and transforms API data into Calypso data
 * @param {?number} freshness indicates how many ms stale data is allowed to be before refetching
 * @return {*} stored data container for request
 */
export const requestHttpData = ( requestId, fetchAction, { fromApi, freshness = Infinity } ) => {
	const data = getHttpData( requestId );
	const { state, lastUpdated } = data;

	if (
		'uninitialized' === state ||
		( 'pending' !== state && Date.now() - lastUpdated > freshness )
	) {
		if ( 'development' === process.env.NODE_ENV && 'function' !== typeof dispatch ) {
			throw new Error( 'Cannot use HTTP data without injecting Redux store enhancer!' );
		}

		const action = {
			type: HTTP_DATA_REQUEST,
			id: requestId,
			fetch: 'function' === typeof fetchAction ? fetchAction() : fetchAction,
			fromApi: 'function' === typeof fromApi ? fromApi : () => a => a,
		};

		dispatch ? dispatch( action ) : dispatchQueue.push( action );
	}

	return data;
};

/**
 * Blocks execution until requested data has been fulfilled
 *
 *  - May return without data if data hasn't been fulfilled or failed
 *  - Use for SSR contexts or when we _want_ to block rendering or execution
 *    until the requested data has been fulfilled, e.g. when URL routing
 *    depends on some data property
 *  - _DO NOT USE_ when normal synchronous/data interactions suffice such
 *    as is the case in 99.999% of React component contexts
 *
 * @example:
 * waitForData( {
 *     geo: () => requestGeoLocation(),
 *     splines: () => requestSplines( siteId ),
 * } ).then( ( { geo, splines } ) => {
 *     return ( geo.state === 'success' || splines.state === 'success' )
 *         ? res.send( renderToStaticMarkup( <LocalSplines geo={ geo.data } splines={ splines.data } /> ) )
 *         : res.send( renderToStaticMarkup( <UnvailableData /> ) );
 * }
 *
 * @param {object} query key/value pairs of data name and request
 * @param {int} timeout how many ms to wait until giving up on requests
 * @return {Promise<object>} fulfilled data of request (or partial if could not fulfill)
 */
export const waitForData = ( query, { timeout } = {} ) =>
	new Promise( ( resolve, reject ) => {
		let unsubscribe = () => {};
		let timer = null;
		const names = Object.keys( query );

		const getValues = () =>
			names.reduce(
				( [ values, allGood, allBad ], name ) => {
					const value = query[ name ]();

					return [
						{ ...values, [ name ]: value },
						allGood && value.state === 'success',
						allBad && value.state === 'failure',
					];
				},
				[ {}, true, true ]
			);

		const listener = () => {
			const [ values, allGood, allBad ] = getValues();

			if ( allBad ) {
				clearTimeout( timer );
				unsubscribe();
				reject( values );
			}

			if ( allGood ) {
				clearTimeout( timer );
				unsubscribe();
				resolve( values );
			}
		};

		if ( timeout ) {
			timer = setTimeout( () => {
				const [ values ] = getValues();

				unsubscribe();
				reject( values );
			}, timeout );
		}

		unsubscribe = subscribe( listener );
		listener();
	} );

if ( 'object' === typeof window && window.app && window.app.isDebug ) {
	window.getHttpData = getHttpData;
	window.httpData = httpData;
	window.requestHttpData = requestHttpData;
	window.waitForData = waitForData;
}
