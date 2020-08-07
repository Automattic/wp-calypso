/**
 * External dependencies
 */
import { noop } from 'lodash';

export const featuresItems = [
	{
		text: 'Image hosting',
	},
	{
		text: 'Video hosting',
	},
];

export const features = {
	items: featuresItems,
};

export const planCard = {
	iconSlug: 'jetpack_complete_v2',
	productName: 'Jetpack Complete',
	subheadline: 'Complete WordPress security, performance, and growth',
	description: 'The most powerful WordPress sites: Top-tier security bundle, enhanced search',
	currencyCode: 'USD',
	originalPrice: 100,
	billingTimeFrame: 'per month, billed monthly',
	buttonLabel: 'Get Jetpack Complete',
	onButtonClick: noop,
	features,
};

export const planCardWithBadge = {
	...planCard,
	badgeLabel: 'Best value',
};

export const planCardWithDiscount = {
	...planCard,
	discountedPrice: 80,
	withStartingPrice: true,
};

export const deprecatedPlanCard = {
	...planCard,
	badgeLabel: 'Best value',
	discountedPrice: 80,
	withStartingPrice: true,
	deprecated: true,
};
