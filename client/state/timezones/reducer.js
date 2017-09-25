/**
 * Internal dependencies
 */
import { rawOffsetsSchema, labelsSchema, continentsSchema } from './schema';
import { TIMEZONES_RECEIVE } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const rawOffsets = createReducer( {}, {
	[ TIMEZONES_RECEIVE ]: ( state, actions ) => ( actions.rawOffsets )
}, rawOffsetsSchema );

export const labels = createReducer( {}, {
	[ TIMEZONES_RECEIVE ]: ( state, actions ) => ( actions.labels )
}, labelsSchema );

export const byContinents = createReducer( {}, {
	[ TIMEZONES_RECEIVE ]: ( state, actions ) => ( actions.byContinents )
}, continentsSchema );

export default combineReducers( {
	rawOffsets,
	labels,
	byContinents,
} );
