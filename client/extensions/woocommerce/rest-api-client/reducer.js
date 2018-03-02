/** @format */

/**
 * Internal dependencies
 */
import { WOOCOMMERCE_API_CLIENT_REQUESTED, WOOCOMMERCE_API_CLIENT_RECEIVED } from './action-types';

const reducers = {
	[ WOOCOMMERCE_API_CLIENT_REQUESTED ]: handleRequested,
	[ WOOCOMMERCE_API_CLIENT_RECEIVED ]: handleReceived,
};

// TODO: Unit test this
export function handleRequested( endpointState = {}, action, now = new Date() ) {
	const { ids } = action;

	// Convert array of ids to updated items.
	const requestedItems = ids.reduce( ( items, id ) => {
		items[ id ] = { ...endpointState[ id ], lastRequested: now };
		return items;
	}, {} );

	return { ...endpointState, ...requestedItems };
}

// TODO: Unit test this
export function handleReceived( endpointState = {}, action, now = new Date() ) {
	const { data: itemArray } = action;

	// Convert array to updated items, keyed by id.
	const receivedItems = itemArray.reduce( ( items, data ) => {
		items[ data.id ] = { ...endpointState[ data.id ], lastReceived: now, data };
		return items;
	}, {} );

	//return { ...endpointState, ...receivedItems };
	const newState = { ...endpointState, ...receivedItems };
	return newState;
}

export default function( apiState = {}, action ) {
	const reducer = reducers[ action.type ];

	if ( reducer ) {
		const { apiType, siteKey, endpoint } = action;
		return nestReducer( [ apiType, siteKey, endpoint ], reducer, apiState, action );
	}
	return apiState;
}

// TODO: Unit test this
export function nestReducer( keys, reducer, state, action ) {
	if ( keys.length ) {
		const key = keys[ 0 ];
		const keyState = state ? state[ key ] : undefined;
		const newKeyState = nestReducer( keys.slice( 1 ), reducer, keyState, action );
		return { ...state, [ key ]: newKeyState };
	}
	return reducer( state, action );
}
