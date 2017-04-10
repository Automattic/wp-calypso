/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { listTypes } from './constants';
import {
	COUNTRIES_RECEIVE,
	COUNTRIES_REQUEST,
	COUNTRIES_REQUEST_FAILURE,
	COUNTRIES_REQUEST_SUCCESS
} from 'state/action-types';
import { itemsSchema } from './schema';
import { createReducer } from 'state/utils';

const { DOMAIN, PAYMENT, SMS } = listTypes;

function createItemsReducer( type ) {
	return createReducer( [], {
		[ COUNTRIES_RECEIVE ]: ( state, { listType, countries } ) => {
			if ( type !== listType ) {
				return state;
			}
			return countries;
		}
	}, itemsSchema );
}

function createIsRequestingReducer( type ) {
	function makeHandler( value ) {
		return ( state, { listType } ) => listType === type ? value : state;
	}

	return createReducer( false, {
		[ COUNTRIES_REQUEST ]: makeHandler( true ),
		[ COUNTRIES_REQUEST_FAILURE ]: makeHandler( false ),
		[ COUNTRIES_REQUEST_SUCCESS ]: makeHandler( false )
	} );
}

export const items = combineReducers( {
	[ SMS ]: createItemsReducer( SMS ),
	[ DOMAIN ]: createItemsReducer( DOMAIN ),
	[ PAYMENT ]: createItemsReducer( PAYMENT )
} );

export const isRequesting = combineReducers( {
	[ SMS ]: createIsRequestingReducer( SMS ),
	[ DOMAIN ]: createIsRequestingReducer( DOMAIN ),
	[ PAYMENT ]: createIsRequestingReducer( PAYMENT )
} );

export default combineReducers( {
	isRequesting,
	items
} );
