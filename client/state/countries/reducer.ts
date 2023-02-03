import { withStorageKey } from '@automattic/state-utils';
import { Reducer } from 'react';
import {
	COUNTRIES_DOMAINS_UPDATED,
	COUNTRIES_PAYMENTS_UPDATED,
	COUNTRIES_SMS_UPDATED,
	COUNTRIES_WOOCOMMERCE_UPDATED,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import type { CountryListItem } from '@automattic/wpcom-checkout';

interface UpdatedDomainCountries {
	type: typeof COUNTRIES_DOMAINS_UPDATED;
	countries: CountryListItem[];
}

interface UpdatedPaymentsCountries {
	type: typeof COUNTRIES_PAYMENTS_UPDATED;
	countries: CountryListItem[];
}

interface UpdatedSmsCountries {
	type: typeof COUNTRIES_SMS_UPDATED;
	countries: CountryListItem[];
}

interface UpdatedWooCountries {
	type: typeof COUNTRIES_WOOCOMMERCE_UPDATED;
	countries: CountryListItem[];
}

type ListReducerAction =
	| UpdatedDomainCountries
	| UpdatedPaymentsCountries
	| UpdatedSmsCountries
	| UpdatedWooCountries;

type ListReducerState = CountryListItem[];

interface CountriesState {
	domains: ListReducerState | undefined;
	payments: ListReducerState | undefined;
	sms: ListReducerState | undefined;
	woocommerce: ListReducerState | undefined;
}

function createListReducer< TActionType extends string >(
	updatedActionType: TActionType
): Reducer< ListReducerState | undefined, ListReducerAction > {
	return ( state: undefined | ListReducerState = [], action: ListReducerAction ) => {
		switch ( action.type ) {
			case updatedActionType:
				return action.countries;
			default:
				return state;
		}
	};
}

const combinedReducer = combineReducers< CountriesState, ListReducerAction >( {
	domains: createListReducer( COUNTRIES_DOMAINS_UPDATED ),
	payments: createListReducer( COUNTRIES_PAYMENTS_UPDATED ),
	sms: createListReducer( COUNTRIES_SMS_UPDATED ),
	woocommerce: createListReducer( COUNTRIES_WOOCOMMERCE_UPDATED ),
} );

const countriesReducer = withStorageKey( 'countries', combinedReducer );
export default countriesReducer;
