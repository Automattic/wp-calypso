/**
 * Internal dependencies
 */
import type { FeatureId } from './types';
import type { FeatureAction } from './actions';
import type { Reducer } from 'redux';

const reducer: Reducer< FeatureId[], FeatureAction > = (
	state: FeatureId[] = [],
	action: FeatureAction
) => {
	if ( action.type === 'ADD_FEATURE' ) {
		return [ ...state, action.featureId ];
	}

	if ( action.type === 'REMOVE_FEATURE' ) {
		return state.filter( ( id ) => id !== action.featureId );
	}

	return state;
};

export type State = FeatureId[];

export default reducer;
