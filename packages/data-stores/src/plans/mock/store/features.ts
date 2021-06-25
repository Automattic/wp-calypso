/**
 * Internal dependencies
 */
import * as MockData from '../';
import type { PlanSimplifiedFeature, PlanFeature } from '../../types';

// Plan "simplified" features
export const STORE_SIMPLIFIED_FEATURE_CUSTOM_DOMAIN: PlanSimplifiedFeature = {
	name: MockData.API_FEATURE_CUSTOM_DOMAIN.name,
	requiresAnnuallyBilledPlan: true,
};
export const STORE_SIMPLIFIED_FEATURE_LIVE_SUPPORT: PlanSimplifiedFeature = {
	name: MockData.API_FEATURE_LIVE_SUPPORT.name,
	requiresAnnuallyBilledPlan: true,
};
export const STORE_SIMPLIFIED_FEATURE_PRIORITY_SUPPORT: PlanSimplifiedFeature = {
	name: MockData.API_FEATURE_PRIORITY_SUPPORT.name,
	requiresAnnuallyBilledPlan: false,
};

// Plan features
export const STORE_PLAN_FEATURE_CUSTOM_DOMAIN: PlanFeature = {
	...MockData.API_FEATURE_CUSTOM_DOMAIN,
	type: 'checkbox',
	requiresAnnuallyBilledPlan: true,
};
export const STORE_PLAN_FEATURE_LIVE_SUPPORT: PlanFeature = {
	...MockData.API_FEATURE_LIVE_SUPPORT,
	type: 'checkbox',
	requiresAnnuallyBilledPlan: true,
};
export const STORE_PLAN_FEATURE_PRIORITY_SUPPORT: PlanFeature = {
	...MockData.API_FEATURE_PRIORITY_SUPPORT,
	type: 'checkbox',
	requiresAnnuallyBilledPlan: true,
};
export const STORE_PLAN_FEATURE_RECURRING_PAYMENTS: PlanFeature = {
	...MockData.API_FEATURE_RECURRING_PAYMENTS,
	type: 'checkbox',
	requiresAnnuallyBilledPlan: false,
};
export const STORE_PLAN_FEATURE_WORDADS: PlanFeature = {
	...MockData.API_FEATURE_WORDADS,
	type: 'checkbox',
	requiresAnnuallyBilledPlan: false,
};
