/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { SMS, DOMAIN, PAYMENT } from './constants';
import {
	COUNTRIES_RECEIVE,
	COUNTRIES_REQUEST,
	COUNTRIES_REQUEST_FAILURE,
	COUNTRIES_REQUEST_SUCCESS
} from 'state/action-types';
import { countriesSchema } from './schema';
import { createReducer } from 'state/utils';

export const items = createReducer( { [ SMS ]: [], [ DOMAIN ]: [], [ PAYMENT ]: [] }, {
	[ COUNTRIES_RECEIVE ]: ( state, action ) => ( { ...state, [ action.listType ]: action.countries } )
}, countriesSchema );

export const isFetching = createReducer( { [ SMS ]: false, [ DOMAIN ]: false, [ PAYMENT ]: false }, {
	[ COUNTRIES_REQUEST ]: ( state, { listType } ) => ( { ...state, [ listType ]: true } ),
	[ COUNTRIES_REQUEST_SUCCESS ]: ( state, { listType } ) => ( { ...state, [ listType ]: false } ),
	[ COUNTRIES_REQUEST_FAILURE ]: ( state, { listType } ) => ( { ...state, [ listType ]: false } )
} );

export default combineReducers( {
	isFetching,
	items
} );
