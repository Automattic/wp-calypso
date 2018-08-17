/** @format */
export { delayAction, enhancer as delayEnhancer } from './task-delay';
export { http, enhancer as httpEnhancer } from './task-http';

const REQUEST_UPDATE = '@@js-request/update';

export const storage = new Map();

const empty = Object.freeze( {
	state: 'uninitialized',
	data: undefined,
	error: undefined,
	lastUpdated: -Infinity,
	pendingSince: undefined,
} );

export const peek = id => storage.get( id ) || empty;

export const update = ( id, state, data ) => {
	const lastUpdated = Date.now();
	const item = storage.get( id );
	const hasItem = item !== undefined;

	// We could have left out the keys for
	// the previous properties if they didn't
	// exist but I wanted to make sure we can
	// get our hidden classes to optimize here.
	switch ( state ) {
		case 'failure':
			return storage.set( id, {
				state,
				data: hasItem ? item.data : undefined,
				error: data,
				lastUpdated: hasItem ? item.lastUpdated : -Infinity,
				pendingSince: undefined,
			} );

		case 'pending':
			return storage.set( id, {
				state,
				data: hasItem ? item.data : undefined,
				error: undefined,
				lastUpdated: hasItem ? item.lastUpdated : -Infinity,
				pendingSince: lastUpdated,
			} );

		case 'success':
			return storage.set( id, {
				state,
				data,
				error: undefined,
				lastUpdated,
				pendingSince: undefined,
			} );
	}
};

const parseResponse = ( data, parser ) => {
	try {
		return [ undefined, parser( data ) ];
	} catch ( error ) {
		return [ error, undefined ];
	}
};

export const reducer = ( state = 0, { type } ) => ( REQUEST_UPDATE === type ? state + 1 : state );

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

	const intercept = action => {
		if ( ! ( action.meta && action.meta.task && action.meta.request ) ) {
			// not relevant, nothing to see here, move along
			return dispatch( action );
		}

		// something is interesting about this request
		const {
			meta: { task, request },
		} = action;

		if ( task.hasOwnProperty( 'error' ) ) {
			update( request.id, 'failure', task.error );
		} else if ( task.hasOwnProperty( 'data' ) ) {
			const { data: rawData } = task;
			const { parser } = request;
			const [ error, data ] = parser ? parseResponse( rawData, parser ) : [ undefined, [] ];

			if ( undefined !== error ) {
				update( request.requestId, 'failure', error );
			}

			update( request.id, 'success', rawData );
			data.forEach( ( [ id, resource ] ) => update( id, 'success', resource ) );
		} else {
			update( request.id, 'pending' );
		}

		return dispatch( {
			type: REQUEST_UPDATE,
			requestId: request.id,
		} );
	};

	return {
		...store,
		dispatch: intercept,
	};
};

export const request = ( id, fetchAction, { parser, freshness = Infinity } ) => {
	const data = peek( id );
	const { state, lastUpdated } = data;

	if (
		'uninitialized' === state ||
		( 'pending' !== state && Date.now() - lastUpdated > freshness )
	) {
		if ( 'development' === process.env.NODE_ENV && 'function' !== typeof dispatch ) {
			throw new Error( 'Cannot use data requests without injecting Redux store enhancer!' );
		}

		const action = {
			...fetchAction,
			meta: {
				...fetchAction.meta,
				request: {
					id,
					parser,
				},
			},
		};

		dispatch ? dispatch( action ) : dispatchQueue.push( action );
	}

	return data;
};

if ( 'object' === typeof window && window.app && window.app.isDebug ) {
	window.jsRequest = {
		peek,
		request,
		storage,
	};
}
