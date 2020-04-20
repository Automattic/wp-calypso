/**
 * External dependencies
 */
import { Reducer, AnyAction, Dispatch, Action, StoreEnhancerStoreCreator } from 'redux';

/**
 * Internal dependencies
 */
import { HTTP_DATA_REQUEST, HTTP_DATA_TICK } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

/**
 * Types
 */
import { Lazy, TimestampMS, TimerHandle } from 'types';

enum DataState {
	Failure = 'failure',
	Pending = 'pending',
	Success = 'success',
	Uninitialized = 'uninitialized',
}

interface ResourceData {
	state: DataState;
	data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	error: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	lastUpdated: TimestampMS;
	pendingSince: TimestampMS | undefined;
}

type Resource =
	| ( ResourceData & {
			state: DataState.Uninitialized;
			data: undefined;
			error: undefined;
			pendingSince: undefined;
	  } )
	| ( ResourceData & { state: DataState.Pending; error: undefined; pendingSince: TimestampMS } )
	| ( ResourceData & { state: DataState.Failure; pendingSince: undefined } )
	| ( ResourceData & { state: DataState.Success; error: undefined; pendingSince: undefined } );

type DataId = string;

export const httpData = new Map< DataId, Resource >();
export const listeners = new Set< () => void >();

export const empty: Readonly< Resource > = Object.freeze( {
	state: DataState.Uninitialized,
	data: undefined,
	error: undefined,
	lastUpdated: -Infinity,
	pendingSince: undefined,
} );

export const getHttpData = ( id: DataId ) => httpData.get( id ) || empty;

export const subscribe = ( f: () => void ): ( () => void ) => {
	listeners.add( f );

	return () => void listeners.delete( f );
};

export const updateData = ( id: DataId, state: DataState, data: unknown ): typeof httpData => {
	const lastUpdated: TimestampMS = Date.now();
	const item = httpData.get( id ) || empty;

	// We could have left out the keys for
	// the previous properties if they didn't
	// exist but I wanted to make sure we can
	// get our hidden classes to optimize here.
	switch ( state ) {
		case DataState.Failure:
			return httpData.set( id, {
				state,
				data: item.data,
				error: data,
				lastUpdated: item.lastUpdated,
				pendingSince: undefined,
			} );

		case DataState.Pending:
			return httpData.set( id, {
				state,
				data: item.data,
				error: undefined,
				lastUpdated: item.lastUpdated,
				pendingSince: lastUpdated,
			} );

		case DataState.Success:
			return httpData.set( id, {
				state,
				data,
				error: undefined,
				lastUpdated,
				pendingSince: undefined,
			} );

		// We do not expect to hit this case, it is included for exhaustiveness.
		case DataState.Uninitialized:
			return httpData;
	}
};

export const resetHttpData = ( id: DataId ) => httpData.set( id, empty );

export const update = ( id: DataId, state: DataState, data?: unknown ) => {
	const updated = updateData( id, state, data );

	listeners.forEach( ( f ) => f() );

	return updated;
};

const fetch = ( action: HttpDataAction ) => {
	update( action.id, DataState.Pending );

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

const onError = ( action: HttpDataAction, error: unknown ) => {
	update( action.id, DataState.Failure, error );

	return { type: HTTP_DATA_TICK };
};

type SuccessfulParse = [ undefined, ReturnType< ResponseParser > ];
type FailedParse = [ unknown, undefined ];
type ParseResult = SuccessfulParse | FailedParse;

/**
 * Transforms API response data into storable data
 * Returns pairs of data ids and data plus an error indicator
 *
 * [ error?, [ [ id, data ], [ id, data ], … ] ]
 *
 * @example
 *   --input--
 *   { data: { sites: {
 *     14: { is_active: true, name: 'foo' },
 *     19: { is_active: false, name: 'bar' }
 *   } } }
 *
 *   --output--
 *   [ [ 'site-names-14', 'foo' ] ]
 *
 * @param data - input data from API response
 * @param fromApi - transforms API response data
 * @returns output data to store
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseResponse = ( data: any, fromApi: ResponseParser ): ParseResult => {
	try {
		return [ undefined, fromApi( data ) ];
	} catch ( error ) {
		return [ error, undefined ];
	}
};

const onSuccess = ( action: HttpDataAction, apiData: unknown ) => {
	const [ error, data ] = parseResponse( apiData, action.fromApi() );

	if ( undefined === data ) {
		return onError( action, error );
	}

	update( action.id, DataState.Success, apiData );
	data.forEach( ( [ id, resource ] ) => update( id, DataState.Success, resource ) );

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

export const reducer: Reducer< number, Action< typeof HTTP_DATA_TICK > > = (
	state = 0,
	{ type }
) => ( HTTP_DATA_TICK === type ? state + 1 : state) ;

interface HttpDataAction extends Action< typeof HTTP_DATA_REQUEST > {
	id: DataId;
	fetch: AnyAction;
	fromApi: Lazy< ResponseParser >;
}

let dispatch: Dispatch< AnyAction >;
let dispatchQueue: HttpDataAction[] = [];

export const enhancer = ( next: StoreEnhancerStoreCreator ) => (
	...args: Parameters< StoreEnhancerStoreCreator >
) => {
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

type ResourcePair = [ DataId, any ]; // eslint-disable-line @typescript-eslint/no-explicit-any
type ResponseParser = ( apiData: any ) => ResourcePair[]; // eslint-disable-line @typescript-eslint/no-explicit-any

interface RequestHttpDataOptions {
	fromApi?: Lazy< ResponseParser >;
	freshness?: number;
}

/**
 * Fetches data from a fetchable action
 *
 * @param requestId - uniquely identifies the request or request type
 * @param fetchAction - action that when dispatched will request the data (may be wrapped in a lazy thunk)
 * @param options - object with options for the http request. Following options are allowed:
 *     - fromAPI: when called produces a function that validates and transforms API data into Calypso data
 *     - freshness - indicates how many ms stale data is allowed to be before refetching
 * @returns stored data container for request
 */
export const requestHttpData = (
	requestId: DataId,
	fetchAction: Lazy< AnyAction > | AnyAction,
	{ fromApi, freshness = Infinity }: RequestHttpDataOptions
): Resource => {
	const data = getHttpData( requestId );
	const { state, lastUpdated } = data;

	if (
		DataState.Uninitialized === state ||
		( DataState.Pending !== state && Date.now() - lastUpdated > freshness )
	) {
		if ( 'development' === process.env.NODE_ENV && 'function' !== typeof dispatch ) {
			throw new Error( 'Cannot use HTTP data without injecting Redux store enhancer!' );
		}

		const action: HttpDataAction = {
			type: HTTP_DATA_REQUEST,
			id: requestId,
			fetch: 'function' === typeof fetchAction ? fetchAction() : fetchAction,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			fromApi: 'function' === typeof fromApi ? fromApi : () => ( a: any ) => a,
		};

		dispatch ? dispatch( action ) : dispatchQueue.push( action );
	}

	return data;
};

interface Query {
	[ key: string ]: Lazy< Resource >;
}

type Results< T extends Query > = { [ P in keyof T ]: ReturnType< T[ P ] > };

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
 * @example
 * waitForData( {
 *     geo: () => requestGeoLocation(),
 *     splines: () => requestSplines( siteId ),
 * } ).then( ( { geo, splines } ) => {
 *     return ( geo.state === 'success' || splines.state === 'success' )
 *         ? res.send( renderToStaticMarkup( <LocalSplines geo={ geo.data } splines={ splines.data } /> ) )
 *         : res.send( renderToStaticMarkup( <UnvailableData /> ) );
 * }
 *
 * @param query - key/value pairs of data name and request
 * @param timeout - how many ms to wait until giving up on requests
 * @returns fulfilled data of request (or partial if could not fulfill)
 */
export const waitForData = < T extends Query >(
	query: T,
	{ timeout }: { timeout?: number } = {}
): Promise< Results< T > > =>
	new Promise( ( resolve, reject ) => {
		let unsubscribe = () => {};
		let timer: TimerHandle;
		const names = Object.keys( query );

		const getValues = () =>
			names.reduce(
				( [ values, allBad, allDone ], name ) => {
					const value = query[ name ]();

					return [
						{ ...values, [ name ]: value },
						allBad && value.state === DataState.Failure,
						allDone && ( value.state === DataState.Success || value.state === DataState.Failure ),
					];
				},
				[ {}, true, true ] as [ Results< T >, boolean, boolean ]
			);

		const listener = () => {
			const [ values, allBad, allDone ] = getValues();

			if ( allDone ) {
				clearTimeout( timer );
				unsubscribe();
				allBad ? reject( values ) : resolve( values );
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
