/**
 * Internal dependencies
 */
import type { FeaturesByType } from '../../types';

// Individual Features
export const API_FEATURE_CUSTOM_DOMAIN = {
	id: 'custom-domain',
	name: 'Free domain for One Year',
	description:
		'Get a free domain for one year. Premium domains not included. Your domain will renew at its regular price.',
};
export const API_FEATURE_LIVE_SUPPORT = {
	id: 'support-live',
	name: 'Live chat support',
	description:
		'High quality support to help you get your website up and running and working how you want it.',
};
export const API_FEATURE_PRIORITY_SUPPORT = {
	id: 'priority-support',
	name: '24/7 Priority live chat support',
	description: 'Receive faster support from our WordPress experts - weekends included.',
};
export const API_FEATURE_RECURRING_PAYMENTS = {
	id: 'recurring-payments',
	name: 'Sell subscriptions (recurring payments)',
	description: 'Accept one-time, monthly or annual payments on your website.',
};
export const API_FEATURE_WORDADS = {
	id: 'wordads',
	name: 'WordAds',
	description: 'Put your site to work and earn through ad revenue.',
};

// Feature groups (by type)
export const API_FEATURES_BY_TYPE_GENERAL: FeaturesByType = {
	id: 'general',
	name: null,
	features: [
		API_FEATURE_CUSTOM_DOMAIN.id,
		API_FEATURE_LIVE_SUPPORT.id,
		API_FEATURE_PRIORITY_SUPPORT.id,
	],
};
export const API_FEATURES_BY_TYPE_COMMERCE: FeaturesByType = {
	id: 'commerce',
	name: 'Commerce',
	features: [ API_FEATURE_RECURRING_PAYMENTS.id ],
};
export const API_FEATURES_BY_TYPE_MARKETING: FeaturesByType = {
	id: 'marketing',
	name: 'Marketing',
	features: [ API_FEATURE_WORDADS.id ],
};
