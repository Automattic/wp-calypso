/** @format */
/**
 * Internal dependencies
 */
import { HTTP_DATA_REQUEST, HTTP_DATA_TICK } from 'state/action-types';

export const reducer = ( state = 0, { type } ) => ( HTTP_DATA_TICK === type ? state + 1 : state );

export const httpData = new Map();

export const update = ( id, state, data ) => {
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

const empty = Object.freeze( {
	state: 'uninitialized',
	data: undefined,
	error: undefined,
	lastUpdated: -Infinity,
	pendingSince: undefined,
} );

let dispatch;

export const enhancer = next => ( ...args ) => {
	const store = next( ...args );

	dispatch = store.dispatch;

	return store;
};

export const getHttpData = id => httpData.get( id ) || empty;

export const requestHttpData = ( id, fetchAction, { fromApi, freshness } ) => {
	const data = getHttpData( id );
	const { state, lastUpdated } = data;

	if (
		'uninitialized' === state ||
		( 'number' === typeof freshness && 'pending' !== state && Date.now() - lastUpdated > freshness )
	) {
		if ( 'development' === process.env.NODE_ENV && 'function' !== typeof dispatch ) {
			throw new Error( 'Cannot use HTTP data without injecting Redux store enhancer!' );
		}

		dispatch( { type: HTTP_DATA_REQUEST, id, fetch: fetchAction, fromApi } );
	}

	return data;
};
