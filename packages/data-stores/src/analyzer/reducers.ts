import { combineReducers } from '@wordpress/data';
import type { Action } from './actions';
import type { ColorsState } from './types';
import type { Reducer } from 'redux';

const analyzer: Reducer< ColorsState, Action > = ( state = {}, action ) => {
	if ( action.type === 'COLORS_ANALYZE_START' ) {
		return {
			analyzing: true,
		};
	}

	if ( action.type === 'COLORS_ANALYZE_SUCCESS' ) {
		const colors = { ...state.colors };
		colors[ action.data.url ] = action.data.colors;

		return {
			analyzing: false,
			colors,
		};
	}

	if ( action.type === 'COLORS_ANALYZE_FAILED' ) {
		return {
			analyzing: false,
		};
	}

	return state;
};

const reducers = combineReducers( { analyzer } );

export type State = ReturnType< typeof reducers >;

export default reducers;
