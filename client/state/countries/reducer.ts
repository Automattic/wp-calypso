import { withStorageKey } from '@automattic/state-utils';
import {
	COUNTRIES_DOMAINS_UPDATED,
	COUNTRIES_PAYMENTS_UPDATED,
	COUNTRIES_SMS_UPDATED,
	COUNTRIES_WOOCOMMERCE_UPDATED,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { Reducer } from 'react';
import type { AnyAction } from 'redux';

function createListReducer< TActionType extends string >(
	updatedActionType: TActionType
): Reducer< CountryListItem[] | undefined, AnyAction > {
	return ( state: undefined | CountryListItem[] = [], action: AnyAction ) => {
		switch ( action.type ) {
			case updatedActionType:
				return action.countries;
			default:
				return state;
		}
	};
}

const combinedReducer = combineReducers( {
	domains: createListReducer( COUNTRIES_DOMAINS_UPDATED ),
	payments: createListReducer( COUNTRIES_PAYMENTS_UPDATED ),
	sms: createListReducer( COUNTRIES_SMS_UPDATED ),
	woocommerce: createListReducer( COUNTRIES_WOOCOMMERCE_UPDATED ),
} );

const countriesReducer = withStorageKey( 'countries', combinedReducer );
export default countriesReducer;
