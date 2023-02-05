import { withStorageKey } from '@automattic/state-utils';
import {
	COUNTRIES_DOMAINS_UPDATED,
	COUNTRIES_PAYMENTS_UPDATED,
	COUNTRIES_SMS_UPDATED,
	COUNTRIES_WOOCOMMERCE_UPDATED,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import type { CountriesState } from './types';
import type { Reducer } from 'react';
import type { AnyAction } from 'redux';

function createListReducer<
	TType extends Exclude< keyof CountriesState, 'woocommerce' >,
	TActionType extends string
>( updatedActionType: TActionType ): Reducer< CountriesState[ TType ] | undefined, AnyAction > {
	return ( state: undefined | CountriesState[ TType ] = [], action: AnyAction ) => {
		switch ( action.type ) {
			case updatedActionType:
				return action.countries;
			default:
				return state;
		}
	};
}

function createObjectReducer<
	TType extends Extract< keyof CountriesState, 'woocommerce' >,
	TActionType extends string
>( updatedActionType: TActionType ): Reducer< CountriesState[ TType ] | undefined, AnyAction > {
	return ( state: undefined | CountriesState[ TType ] = {}, action: AnyAction ) => {
		switch ( action.type ) {
			case updatedActionType:
				return action.countries;
			default:
				return state;
		}
	};
}

const combinedReducer = combineReducers( {
	// Note: it would be nice to not need to specify the second generic type
	// here, since it can be inferred from the argument, but if you pass any
	// generics, you must pass all generics. May possibly be solved by
	// https://github.com/microsoft/TypeScript/pull/26349
	domains: createListReducer< 'domains', typeof COUNTRIES_DOMAINS_UPDATED >(
		COUNTRIES_DOMAINS_UPDATED
	),
	payments: createListReducer< 'payments', typeof COUNTRIES_PAYMENTS_UPDATED >(
		COUNTRIES_PAYMENTS_UPDATED
	),
	sms: createListReducer< 'sms', typeof COUNTRIES_SMS_UPDATED >( COUNTRIES_SMS_UPDATED ),
	woocommerce: createObjectReducer< 'woocommerce', typeof COUNTRIES_WOOCOMMERCE_UPDATED >(
		COUNTRIES_WOOCOMMERCE_UPDATED
	),
} );

const countriesReducer = withStorageKey( 'countries', combinedReducer );
export default countriesReducer;
