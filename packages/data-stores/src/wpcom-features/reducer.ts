import { featuresList } from './features-data';
import type { Feature, FeatureId } from './types';
import type { AnyAction, Reducer } from 'redux';

export type State = Record< FeatureId, Feature >;

const reducer: Reducer< State, AnyAction > = ( state = featuresList ) => {
	return state;
};

export default reducer;
