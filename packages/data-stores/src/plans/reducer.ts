/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { PlanAction } from './actions';
import type { Plan, PlanFeature, FeaturesByType, PlanProduct } from './types';

// create a Locale type just for code readability
type Locale = string;

export const features: Reducer< Record< Locale, Record< string, PlanFeature > >, PlanAction > = (
	state = {},
	action
) => {
	switch ( action.type ) {
		case 'SET_FEATURES':
			return { ...state, [ action.locale ]: action.features };
		default:
			return state;
	}
};

export const featuresByType: Reducer< Record< Locale, Array< FeaturesByType > >, PlanAction > = (
	state = {},
	action
) => {
	switch ( action.type ) {
		case 'SET_FEATURES_BY_TYPE':
			return { ...state, [ action.locale ]: action.featuresByType };
		default:
			return state;
	}
};

export const plans: Reducer< Record< Locale, Plan[] >, PlanAction > = ( state = {}, action ) => {
	switch ( action.type ) {
		case 'SET_PLANS':
			return { ...state, [ action.locale ]: action.plans };
		default:
			return state;
	}
};

export const planProducts: Reducer< PlanProduct[], PlanAction > = ( state = [], action ) => {
	switch ( action.type ) {
		case 'SET_PLAN_PRODUCTS':
			return action.products;
		default:
			return state;
	}
};

const reducer = combineReducers( {
	features,
	featuresByType,
	planProducts,
	plans,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
