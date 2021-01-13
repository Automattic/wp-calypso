/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { PlanAction } from './actions';
import type { Plan, PlanFeature, PlanFeatureType } from './types';

export const features: Reducer< Record< string, PlanFeature >, PlanAction > = (
	state = {},
	action
) => {
	switch ( action.type ) {
		case 'SET_FEATURES':
			return action.features;
		default:
			return state;
	}
};

export const featuresByType: Reducer< Array< PlanFeatureType >, PlanAction > = (
	state = [],
	action
) => {
	switch ( action.type ) {
		case 'SET_FEATURES_BY_TYPE':
			return action.featuresByType;
		default:
			return state;
	}
};

export const plans: Reducer< Record< string, Plan >, PlanAction > = ( state = {}, action ) => {
	switch ( action.type ) {
		case 'SET_PLANS':
			return action.plans;
		default:
			return state;
	}
};

const reducer = combineReducers( {
	features,
	featuresByType,
	plans,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
