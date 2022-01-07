import { withStorageKey } from '@automattic/state-utils';
import {
	WOOP_COUNTRY_REGIONS_RECEIVE,
	WOOP_COUNTRY_REGIONS_REQUEST,
	WOOP_COUNTRY_REGIONS_REQUEST_FAILURE,
	WOOP_COUNTRY_REGIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { itemSchema } from './schema';

// Stores the complete list of states, indexed by locale key
export const items = withSchemaValidation( itemSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case WOOP_COUNTRY_REGIONS_RECEIVE:
			return {
				...state,
				[ action.countryCode ]: action.countryRegions,
			};
	}

	return state;
} );

// Tracks states list fetching state
export const isFetching = ( state = {}, action ) => {
	switch ( action.type ) {
		case WOOP_COUNTRY_REGIONS_REQUEST: {
			const { countryCode } = action;

			return {
				...state,
				[ countryCode ]: true,
			};
		}
		case WOOP_COUNTRY_REGIONS_REQUEST_SUCCESS: {
			const { countryCode } = action;

			return {
				...state,
				[ countryCode ]: false,
			};
		}
		case WOOP_COUNTRY_REGIONS_REQUEST_FAILURE: {
			const { countryCode } = action;

			return {
				...state,
				[ countryCode ]: false,
			};
		}
	}

	return state;
};

const combinedReducer = combineReducers( {
	isFetching,
	items,
} );

export default withStorageKey( 'woopCountryRegions', combinedReducer );
