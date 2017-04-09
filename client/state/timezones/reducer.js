/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	TIMEZONES_RECEIVE,
	TIMEZONES_REQUEST,
} from 'state/action-types';

import {
	rawOffsetsSchema,
	labelsSchema,
	continentsSchema
} from './schema';

export const rawOffsets = createReducer( {}, {
	[ TIMEZONES_RECEIVE ]: ( state, actions ) => ( actions.rawOffsets )
}, rawOffsetsSchema );

export const labels = createReducer( {}, {
	[ TIMEZONES_RECEIVE ]: ( state, actions ) => ( actions.labels )
}, labelsSchema );

export const byContinents = createReducer( {}, {
	[ TIMEZONES_RECEIVE ]: ( state, actions ) => ( actions.byContinents )
}, continentsSchema );

export const isRequesting = ( state = false, { type } ) => (
	type === TIMEZONES_REQUEST
);

export default combineReducers( {
	rawOffsets,
	labels,
	byContinents,
	isRequesting
} );
