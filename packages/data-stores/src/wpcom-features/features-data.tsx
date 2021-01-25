/**
 * External dependencies
 */
import * as Plans from '../plans';
import type { FeatureId, Feature } from './types';
/**
 * Internal dependencies
 */
const {
	TIMELESS_PLAN_PERSONAL,
	TIMELESS_PLAN_PREMIUM,
	TIMELESS_PLAN_BUSINESS,
	TIMELESS_PLAN_ECOMMERCE,
} = Plans;

export const featuresList: Record< FeatureId, Feature > = {
	domain: {
		id: 'domain',
		minSupportedPlan: TIMELESS_PLAN_PERSONAL,
	},
	store: {
		id: 'store',
		minSupportedPlan: TIMELESS_PLAN_ECOMMERCE,
	},
	seo: {
		id: 'seo',
		minSupportedPlan: TIMELESS_PLAN_BUSINESS,
	},
	plugins: {
		id: 'plugins',
		minSupportedPlan: TIMELESS_PLAN_BUSINESS,
	},
	'ad-free': {
		id: 'ad-free',
		minSupportedPlan: TIMELESS_PLAN_PERSONAL,
	},
	'image-storage': {
		id: 'image-storage',
		minSupportedPlan: TIMELESS_PLAN_PREMIUM,
	},
	'video-storage': {
		id: 'video-storage',
		minSupportedPlan: TIMELESS_PLAN_PREMIUM,
	},
	support: {
		id: 'support',
		minSupportedPlan: TIMELESS_PLAN_BUSINESS,
	},
};
