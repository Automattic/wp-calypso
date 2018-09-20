/** @format */

/**
 * External dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	COUNTRIES_DOMAINS_FETCH,
	COUNTRIES_DOMAINS_UPDATED,
	COUNTRIES_PAYMENTS_FETCH,
	COUNTRIES_PAYMENTS_UPDATED,
	COUNTRIES_SMS_FETCH,
	COUNTRIES_SMS_UPDATED,
} from 'state/action-types';

const createListReducer = ( fetchActionType, updatedActionType ) =>
	createReducer(
		{
			isFetching: false,
			items: [],
		},
		{
			[ fetchActionType ]: state => ( {
				...state,
				isFetching: true,
			} ),
			[ updatedActionType ]: ( state, action ) => ( {
				isFetching: false,
				items: action.countries,
			} ),
		}
	);

const domains = createListReducer( COUNTRIES_DOMAINS_FETCH, COUNTRIES_DOMAINS_UPDATED );

const payments = createListReducer( COUNTRIES_PAYMENTS_FETCH, COUNTRIES_PAYMENTS_UPDATED );

const sms = createListReducer( COUNTRIES_SMS_FETCH, COUNTRIES_SMS_UPDATED );

export default combineReducers( {
	domains,
	payments,
	sms,
} );
