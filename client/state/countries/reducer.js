/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	DOMAIN_REGISTRATION_COUNTRIES_REQUEST,
	DOMAIN_REGISTRATION_COUNTRIES_REQUEST_FAILURE,
	DOMAIN_REGISTRATION_COUNTRIES_REQUEST_SUCCESS,
	PAYMENTS_COUNTRIES_REQUEST,
	PAYMENTS_COUNTRIES_REQUEST_FAILURE,
	PAYMENTS_COUNTRIES_REQUEST_SUCCESS,
	SMS_COUNTRIES_REQUEST,
	SMS_COUNTRIES_REQUEST_FAILURE,
	SMS_COUNTRIES_REQUEST_SUCCESS,
} from 'state/action-types';
import { createReducer } from 'state/utils';

function countries( actions ) {
	return createReducer( [], {
		[ actions.success ]: ( state, action ) => action.countries
	} );
}

function isFetching( actions ) {
	return createReducer( false, {
		[ actions.request ]: () => true,
		[ actions.failure ]: () => false,
		[ actions.success ]: () => false
	} );
}

export function getReducer( actions ) {
	return combineReducers( {
		countries: countries( actions ),
		isFetching: isFetching( actions )
	} );
}

export const countriesForDomainRegistrations = getReducer( {
	request: DOMAIN_REGISTRATION_COUNTRIES_REQUEST,
	success: DOMAIN_REGISTRATION_COUNTRIES_REQUEST_SUCCESS,
	failure: DOMAIN_REGISTRATION_COUNTRIES_REQUEST_FAILURE
} );

export const countriesForPayments = getReducer( {
	request: PAYMENTS_COUNTRIES_REQUEST,
	success: PAYMENTS_COUNTRIES_REQUEST_SUCCESS,
	failure: PAYMENTS_COUNTRIES_REQUEST_FAILURE
} );

export const countriesForSms = getReducer( {
	request: SMS_COUNTRIES_REQUEST,
	success: SMS_COUNTRIES_REQUEST_SUCCESS,
	failure: SMS_COUNTRIES_REQUEST_FAILURE
} );
