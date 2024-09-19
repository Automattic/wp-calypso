import { STATS_PLAN_USAGE_RECEIVE } from 'calypso/state/action-types';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import { schema } from './schema';
import type { Reducer, AnyAction } from 'redux';

const dataReducer = ( state = {}, action: AnyAction ) => {
	switch ( action.type ) {
		case STATS_PLAN_USAGE_RECEIVE: {
			return action.data;
		}
	}
	return state;
};

export const data = withSchemaValidation(
	schema,
	keyedReducer( 'siteId', withPersistence( dataReducer as Reducer ) )
);

export default combineReducers( { data } );
