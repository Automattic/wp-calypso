/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation, withStorageKey } from 'calypso/state/utils';
import { TIMEZONES_RECEIVE } from 'calypso/state/action-types';

import { rawOffsetsSchema, labelsSchema, continentsSchema } from './schema';

export const rawOffsets = withSchemaValidation( rawOffsetsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case TIMEZONES_RECEIVE:
			return action.rawOffsets;
	}

	return state;
} );

export const labels = withSchemaValidation( labelsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case TIMEZONES_RECEIVE:
			return action.labels;
	}

	return state;
} );

export const byContinents = withSchemaValidation( continentsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case TIMEZONES_RECEIVE:
			return action.byContinents;
	}

	return state;
} );

const combinedReducer = combineReducers( {
	rawOffsets,
	labels,
	byContinents,
} );

export default withStorageKey( 'timezones', combinedReducer );
