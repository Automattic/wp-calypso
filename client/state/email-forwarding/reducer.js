/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REQUEST_FAILURE,
} from 'state/action-types';
import { forwardsSchema } from './schema';

export const isRequesting = createReducer( null, {
	[ EMAIL_FORWARDING_REQUEST ]: () => true,
	[ EMAIL_FORWARDING_REQUEST_SUCCESS ]: () => false,
	[ EMAIL_FORWARDING_REQUEST_FAILURE ]: () => false,
} );

export const forwards = createReducer(
	null,
	{
		[ EMAIL_FORWARDING_REQUEST ]: () => null,
		[ EMAIL_FORWARDING_REQUEST_SUCCESS ]: ( state, { data } ) => data.forwards,
	},
	forwardsSchema
);

export const errors = createReducer( null, {
	[ EMAIL_FORWARDING_REQUEST_FAILURE ]: ( state, { error } ) => error,
} );

export default keyedReducer(
	'domainName',
	combineReducers( {
		forwards,
		isRequesting,
		errors,
	} )
);
