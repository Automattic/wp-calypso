/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_RECEIVE,
	EMAIL_FORWARDING_FAILURE,
} from 'state/action-types';

const forwards = createReducer( null, {
	[ EMAIL_FORWARDING_FAILURE ]: () => null,
	[ EMAIL_FORWARDING_RECEIVE ]: ( state, { data } ) => data.forwards,
	[ EMAIL_FORWARDING_REQUEST ]: () => null,
} );

const isRequesting = createReducer( false, {
	[ EMAIL_FORWARDING_FAILURE ]: () => false,
	[ EMAIL_FORWARDING_RECEIVE ]: () => false,
	[ EMAIL_FORWARDING_REQUEST ]: () => true,
} );

const forwardsError = createReducer( null, {
	[ EMAIL_FORWARDING_FAILURE ]: ( state, { error } ) => error,
	[ EMAIL_FORWARDING_RECEIVE ]: () => null,
	[ EMAIL_FORWARDING_REQUEST ]: () => null,
} );

export default keyedReducer(
	'domainName',
	combineReducers( {
		forwards,
		isRequesting,
		forwardsError,
	} )
);
