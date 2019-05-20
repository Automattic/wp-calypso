/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	EXTERNAL_CONTRIBUTORS_GET_REQUEST,
	EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS,
	EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE,
	// EMAIL_FORWARDING_ADD_REQUEST,
	// EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
	// EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
	// EMAIL_FORWARDING_REMOVE_REQUEST,
	// EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS,
	// EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
} from 'state/action-types';

const requestingReducer = createReducer( false, {
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST ]: () => true,
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS ]: () => false,
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE ]: () => false,
} );

export const requestErrorReducer = createReducer( false, {
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST ]: () => false,
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS ]: () => false,
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE ]: ( state, { error: { message } } ) =>
		message || true,
} );

const itemsReducer = createReducer( null, {
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST ]: () => null,
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS ]: ( state, { contributors } ) => contributors || [],
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE ]: () => null,
} );

export default keyedReducer(
	'siteId',
	combineReducers( {
		items: itemsReducer,
		requesting: requestingReducer,
		requestError: requestErrorReducer,
	} )
);
