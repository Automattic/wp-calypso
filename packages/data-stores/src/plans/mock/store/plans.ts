import * as MockData from '../';
import type { Plan } from '../../types';

export const STORE_PLAN_FREE: Plan = {
	description: 'Mock free plan',
	features: [
		{
			name: 'Free plan highlighted feature',
			requiresAnnuallyBilledPlan: false,
		},
	],
	storage: '3 GB',
	title: 'Free',
	featuresSlugs: {
		subdomain: true,
	},
	isFree: true,
	isPopular: false,
	periodAgnosticSlug: 'free',
	productIds: [ 1 ],
};
export const STORE_PLAN_PREMIUM: Plan = {
	description: 'Mock premium plan',
	features: [
		{
			name: MockData.API_FEATURE_CUSTOM_DOMAIN.name,
			requiresAnnuallyBilledPlan: true,
		},
		{
			name: MockData.API_FEATURE_LIVE_SUPPORT.name,
			requiresAnnuallyBilledPlan: true,
		},
		{
			name: 'Premium plan highlighted feature',
			requiresAnnuallyBilledPlan: false,
		},
	],
	storage: '13 GB',
	title: 'Premium',
	featuresSlugs: {
		'custom-domain': true,
		'support-live': true,
		'recurring-payments': true,
		wordads: true,
	},
	isFree: false,
	isPopular: true,
	periodAgnosticSlug: 'premium',
	productIds: [ 1003, 1013 ],
};
