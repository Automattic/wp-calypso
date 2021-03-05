/**
 * External dependencies
 */
import { Reducer, AnyAction, Dispatch, Action, StoreEnhancerStoreCreator } from 'redux';

/**
 * Internal dependencies
 */
import { HTTP_DATA_REQUEST, HTTP_DATA_TICK } from 'calypso/state/action-types';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

/**
 * Types
 */
import { Lazy, TimestampMS, TimerHandle } from 'calypso/types';

export enum DataState {
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

export const updateData = ( id: DataId, state: DataState, data?: unknown ): typeof httpData => {
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

function fireChangeEvents() {
	listeners.forEach( ( f ) => f() );
	return { type: HTTP_DATA_TICK };
}

const fetch = ( action: HttpDataAction ) => {
	updateData( action.id, DataState.Pending );
	const tickAction = fireChangeEvents();

	return [
		{
			...action.fetch,
			onSuccess: action,
			onFailure: action,
			onProgress: action,
		},
		tickAction,
	];
};

const onError = ( action: HttpDataAction, error: unknown ) => {
	updateData( action.id, DataState.Failure, error );
	return fireChangeEvents();
};

const onSuccess = ( action: HttpDataAction, apiData: unknown ) => {
	try {
		const data = action.fromApi()( apiData );
		for ( const [ id, resource ] of data ) {
			updateData( id, DataState.Success, resource );
		}
		return fireChangeEvents();
	} catch ( error ) {
		return onError( action, error );
	}
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
) => ( HTTP_DATA_TICK === type ? state + 1 : state );

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

function defaultFromApi( requestId: DataId ): Lazy< ResponseParser > {
	return () => ( data: any ) => [ [ requestId, data ] ];
}

/**
 * Fetches data from a fetchable action
 *
 * @param requestId - uniquely identifies the request or request type
 * @param fetchAction - action that when dispatched will request the data (may be wrapped in a lazy thunk)
 * @param options - options object
 * @param options.fromApi - when called produces a function that validates and transforms API data into Calypso data
 * @param options.freshness - indicates how many ms stale data is allowed to be before refetching
 * @returns stored data container for request
 */
export const requestHttpData = (
	requestId: DataId,
	fetchAction: Lazy< AnyAction > | AnyAction,
	options: RequestHttpDataOptions = {}
): Resource => {
	const { fromApi = defaultFromApi( requestId ), freshness = Infinity } = options;
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
			fromApi,
		};

		dispatch ? dispatch( action ) : dispatchQueue.push( action );
	}

	return data;
};

interface WaitForHttpDataOptions {
	timeout?: number;
}

interface QueryResults {
	[ key: string ]: Resource;
}

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
 * waitForHttpData( () => ( {
 *     geo: requestGeoLocation(),
 *     splines: requestSplines( siteId ),
 * } ) ).then( ( { geo, splines } ) => {
 *     return ( geo.state === 'success' || splines.state === 'success' )
 *         ? res.send( renderToStaticMarkup( <LocalSplines geo={ geo.data } splines={ splines.data } /> ) )
 *         : res.send( renderToStaticMarkup( <UnvailableData /> ) );
 * }
 *
 * @param query - function that returns key/value pairs of data name and request state
 * @param options - options object
 * @param options.timeout - how many ms to wait until giving up on requests
 * @returns fulfilled data of request (or partial if could not fulfill)
 */
export const waitForHttpData = (
	query: Lazy< QueryResults >,
	options: WaitForHttpDataOptions = {}
): Promise< QueryResults > =>
	new Promise( ( resolve, reject ) => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		let unsubscribe = () => {};
		let timer: TimerHandle;

		const getResults = () => {
			const results = query();
			const values = Object.values( results );
			const allBad = values.every( ( value ) => value.state === DataState.Failure );
			const allDone = values.every( ( value ) =>
				[ DataState.Success, DataState.Failure ].includes( value.state )
			);
			return { results, allBad, allDone };
		};

		const listener = () => {
			const { results, allBad, allDone } = getResults();

			if ( allDone ) {
				clearTimeout( timer );
				unsubscribe();
				allBad ? reject( results ) : resolve( results );
			}
		};

		if ( options.timeout ) {
			timer = setTimeout( () => {
				const { results } = getResults();

				unsubscribe();
				reject( results );
			}, options.timeout );
		}

		unsubscribe = subscribe( listener );
		listener();
	} );

if ( 'object' === typeof window && window.app && window.app.isDebug ) {
	window.getHttpData = getHttpData;
	window.httpData = httpData;
	window.requestHttpData = requestHttpData;
	window.waitForHttpData = waitForHttpData;
}
