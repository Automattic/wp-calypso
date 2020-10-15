/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE } from './constants';
import type { PlanAction } from './actions';
import type { PlanSlug } from './types';
import { PLANS_LIST } from './plans-data';

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

export const supportedPlanSlugs: Reducer< string[], PlanAction > = (
	state = Object.keys( PLANS_LIST ),
	action: PlanAction
) => {
	switch ( action.type ) {
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

export const plansDetails: Reducer< Array< Record< string, unknown > >, PlanAction > = (
	state = [],
	action
) => {
	switch ( action.type ) {
		case 'SET_PLANS_DETAILS':
			return action.plansDetails;
		default:
			return state;
	}
};

const reducer = combineReducers( {
	supportedPlanSlugs,
	prices,
	plansDetails,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
