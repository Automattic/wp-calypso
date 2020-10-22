/**
 * Internal dependencies
 */
import {
	COUNTRY_STATES_RECEIVE,
	COUNTRY_STATES_REQUEST,
	COUNTRY_STATES_REQUEST_FAILURE,
	COUNTRY_STATES_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import {
	combineReducers,
	withoutPersistence,
	withSchemaValidation,
	withStorageKey,
} from 'calypso/state/utils';
import { itemSchema } from './schema';

// Stores the complete list of states, indexed by locale key
export const items = withSchemaValidation( itemSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case COUNTRY_STATES_RECEIVE:
			return {
				...state,
				[ action.countryCode ]: action.countryStates,
			};
	}

	return state;
} );

// Tracks states list fetching state
export const isFetching = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case COUNTRY_STATES_REQUEST: {
			const { countryCode } = action;

			return {
				...state,
				[ countryCode ]: true,
			};
		}
		case COUNTRY_STATES_REQUEST_SUCCESS: {
			const { countryCode } = action;

			return {
				...state,
				[ countryCode ]: false,
			};
		}
		case COUNTRY_STATES_REQUEST_FAILURE: {
			const { countryCode } = action;

			return {
				...state,
				[ countryCode ]: false,
			};
		}
	}

	return state;
} );

const combinedReducer = combineReducers( {
	isFetching,
	items,
} );

export default withStorageKey( 'countryStates', combinedReducer );
