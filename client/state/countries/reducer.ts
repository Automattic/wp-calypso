import { withStorageKey } from '@automattic/state-utils';
import { COUNTRIES_DOMAINS_UPDATED, COUNTRIES_SMS_UPDATED } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import type { CountriesState } from './types';
import type { Reducer } from 'react';
import type { AnyAction } from 'redux';

function createListReducer< TType extends keyof CountriesState >(
	updatedActionType: string
): Reducer< CountriesState[ TType ] | undefined, AnyAction > {
	return ( state: undefined | CountriesState[ TType ] = [], action: AnyAction ) => {
		switch ( action.type ) {
			case updatedActionType:
				return action.countries;
			default:
				return state;
		}
	};
}

const combinedReducer = combineReducers( {
	domains: createListReducer< 'domains' >( COUNTRIES_DOMAINS_UPDATED ),
	sms: createListReducer< 'sms' >( COUNTRIES_SMS_UPDATED ),
} );

const countriesReducer = withStorageKey( 'countries', combinedReducer );
export default countriesReducer;
