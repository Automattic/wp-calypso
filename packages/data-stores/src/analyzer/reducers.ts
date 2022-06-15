import { combineReducers } from '@wordpress/data';
import type { AnalyzerActions } from './actions';
import type { ColorsState } from './types';
import type { Reducer } from 'redux';

const analyzer: Reducer< ColorsState, AnalyzerActions > = ( state = {}, action ) => {
	if ( action.type === 'ANALYZE_COLORS' ) {
		return {
			analyzing: true,
		};
	}

	if ( action.type === 'ANALYZE_COLORS_RECEIVED' ) {
		const colors = { ...state.colors };
		colors[ action.data.url ] = action.data.colors;

		return {
			analyzing: false,
			colors,
		};
	}

	if ( action.type === 'ANALYZE_COLORS_FAILED' ) {
		return {
			analyzing: false,
		};
	}

	return state;
};

const reducers = combineReducers( { analyzer } );

export type State = ReturnType< typeof reducers >;

export default reducers;
