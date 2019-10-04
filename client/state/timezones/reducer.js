/**
 * Internal dependencies
 */
import { combineReducers, createReducerWithValidation } from 'state/utils';
import { TIMEZONES_RECEIVE } from 'state/action-types';

import { rawOffsetsSchema, labelsSchema, continentsSchema } from './schema';

export const rawOffsets = createReducerWithValidation(
	{},
	{
		[ TIMEZONES_RECEIVE ]: ( state, actions ) => actions.rawOffsets,
	},
	rawOffsetsSchema
);

export const labels = createReducerWithValidation(
	{},
	{
		[ TIMEZONES_RECEIVE ]: ( state, actions ) => actions.labels,
	},
	labelsSchema
);

export const byContinents = createReducerWithValidation(
	{},
	{
		[ TIMEZONES_RECEIVE ]: ( state, actions ) => actions.byContinents,
	},
	continentsSchema
);

export default combineReducers( {
	rawOffsets,
	labels,
	byContinents,
} );
