/**
 * External dependencies
 */
import { combineReducers } from 'state/utils';
import {
	COUNTRIES_DOMAINS_UPDATED,
	COUNTRIES_PAYMENTS_UPDATED,
	COUNTRIES_SMS_UPDATED,
} from 'state/action-types';

const createListReducer = ( updatedActionType ) => ( state = [], action ) => {
	switch ( action.type ) {
		case updatedActionType:
			return action.countries;
		default:
			return state;
	}
};

export default combineReducers( {
	domains: createListReducer( COUNTRIES_DOMAINS_UPDATED ),
	payments: createListReducer( COUNTRIES_PAYMENTS_UPDATED ),
	sms: createListReducer( COUNTRIES_SMS_UPDATED ),
} );
