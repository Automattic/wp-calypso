/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	plansProductSlugs,
} from './constants';
import type { PlanAction } from './actions';
import type { Plan, PlanFeature, PlanFeatureType, PlanSlug } from './types';

type PricesMap = {
	[ slug in PlanSlug ]: string;
};

const DEFAULT_PRICES_STATE: PricesMap = {
	[ PLAN_FREE ]: '',
	[ PLAN_PERSONAL ]: '',
	[ PLAN_PREMIUM ]: '',
	[ PLAN_BUSINESS ]: '',
	[ PLAN_ECOMMERCE ]: '',
};

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

export const prices: Reducer< PricesMap, PlanAction > = (
	state = DEFAULT_PRICES_STATE,
	action: PlanAction
) => {
	switch ( action.type ) {
		case 'SET_PRICES':
			return action.prices;
		default:
			return state;
	}
};

export const supportedPlanSlugs: Reducer< string[], PlanAction > = (
	state = plansProductSlugs,
	action: PlanAction
) => {
	switch ( action.type ) {
		default:
			return state;
	}
};

const reducer = combineReducers( {
	features,
	featuresByType,
	plans,
	prices,
	supportedPlanSlugs,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
