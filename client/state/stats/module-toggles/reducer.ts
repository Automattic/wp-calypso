import {
	STATS_MODULE_TOGGLES_REQUEST,
	STATS_MODULE_TOGGLES_RECEIVE,
	STATS_MODULE_TOGGLES_UPDATE,
} from 'calypso/state/action-types';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import { schema } from './schema';
import type { Reducer, AnyAction } from 'redux';

/**
 * Returns the updated modules settings state after an action has been dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
const dataReducer = ( state = {}, action: AnyAction ) => {
	switch ( action.type ) {
		case STATS_MODULE_TOGGLES_RECEIVE: {
			return action.data;
		}

		case STATS_MODULE_TOGGLES_UPDATE: {
			return action.payload;
		}
	}
	return state;
};

export const data = withSchemaValidation(
	schema,
	keyedReducer( 'siteId', withPersistence( dataReducer as Reducer ) )
);

/**
 * Returns the loading state after an action has been dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
const isLoadingReducer = ( state = {}, action: AnyAction ) => {
	switch ( action.type ) {
		case STATS_MODULE_TOGGLES_REQUEST: {
			return true;
		}
		case STATS_MODULE_TOGGLES_RECEIVE: {
			return false;
		}
	}
	return state;
};

export const isLoading = keyedReducer( 'siteId', isLoadingReducer );

export default combineReducers( { data, isLoading } );
