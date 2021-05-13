/**
 * External dependencies
 */
import type { AnyAction, Reducer } from 'redux';

/**
 * Internal dependencies
 */
import type { Feature, FeatureId } from './types';
import { featuresList } from './features-data';

export type State = Record< FeatureId, Feature >;

const reducer: Reducer< State, AnyAction > = ( state = featuresList ) => {
	return state;
};

export default reducer;
