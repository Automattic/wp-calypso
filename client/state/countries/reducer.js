/** @format */
/**
 * External dependencies
 */
import { createReducer, combineReducers } from 'state/utils';
import {
	COUNTRIES_DOMAINS_UPDATED,
	COUNTRIES_PAYMENTS_UPDATED,
	COUNTRIES_SMS_UPDATED,
} from 'state/action-types';

const domains = createReducer( [], {
	[ COUNTRIES_DOMAINS_UPDATED ]: ( countries, action ) => action.countries,
} );

const payments = createReducer( [], {
	[ COUNTRIES_PAYMENTS_UPDATED ]: ( countries, action ) => action.countries,
} );

const sms = createReducer( [], {
	[ COUNTRIES_SMS_UPDATED ]: ( countries, action ) => action.countries,
} );

export default combineReducers( {
	domains,
	payments,
	sms,
} );
