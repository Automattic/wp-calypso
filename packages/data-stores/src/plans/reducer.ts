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
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
} from './constants';
import type { PlanAction } from './actions';
import type { Plan, PlanFeature, PlanFeatureType, PricesMap, DiscountsMap } from './types';

const DEFAULT_PRICES_STATE: PricesMap = {
	[ PLAN_FREE ]: '',
	[ PLAN_PERSONAL ]: '',
	[ PLAN_PREMIUM ]: '',
	[ PLAN_BUSINESS ]: '',
	[ PLAN_ECOMMERCE ]: '',
	[ PLAN_PERSONAL_MONTHLY ]: '',
	[ PLAN_PREMIUM_MONTHLY ]: '',
	[ PLAN_BUSINESS_MONTHLY ]: '',
	[ PLAN_ECOMMERCE_MONTHLY ]: '',
};

const DEFAULT_DISCOUNT_STATE: DiscountsMap = {
	[ PLAN_FREE ]: 0,
	[ PLAN_PERSONAL ]: 0,
	[ PLAN_PREMIUM ]: 0,
	[ PLAN_BUSINESS ]: 0,
	[ PLAN_ECOMMERCE ]: 0,
	[ PLAN_PERSONAL_MONTHLY ]: 0,
	[ PLAN_PREMIUM_MONTHLY ]: 0,
	[ PLAN_BUSINESS_MONTHLY ]: 0,
	[ PLAN_ECOMMERCE_MONTHLY ]: 0,
	maxDiscount: 0,
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

export const discounts: Reducer< DiscountsMap, PlanAction > = (
	state = DEFAULT_DISCOUNT_STATE,
	action: PlanAction
) => {
	switch ( action.type ) {
		case 'SET_DISCOUNTS':
			return action.discounts;
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
	discounts,
	supportedPlanSlugs,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
