/**
 * External dependencies
 */
import * as Plans from '../plans';
import type { FeatureId, Feature } from './types';
/**
 * Internal dependencies
 */
const { PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE } = Plans;

export const featuresList: Record< FeatureId, Feature > = {
	domain: {
		id: 'domain',
		minSupportedPlan: PLAN_PERSONAL,
	},
	store: {
		id: 'store',
		minSupportedPlan: PLAN_ECOMMERCE,
	},
	seo: {
		id: 'seo',
		minSupportedPlan: PLAN_BUSINESS,
	},
	plugins: {
		id: 'plugins',
		minSupportedPlan: PLAN_BUSINESS,
	},
	'ad-free': {
		id: 'ad-free',
		minSupportedPlan: PLAN_PERSONAL,
	},
	'image-storage': {
		id: 'image-storage',
		minSupportedPlan: PLAN_PREMIUM,
	},
	'video-storage': {
		id: 'video-storage',
		minSupportedPlan: PLAN_PREMIUM,
	},
	support: {
		id: 'support',
		minSupportedPlan: PLAN_BUSINESS,
	},
};
