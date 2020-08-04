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
	iconSlug: 'jetpack_business',
	productName: 'Jetpack All In',
	subheadline: 'Complete WordPress security, performance, and growth',
	description: 'The most powerful WordPress sites: Top-tier security bundle, enhanced search',
	currencyCode: 'USD',
	originalPrice: 100,
	billingTimeFrame: 'per month, billed monthly',
	buttonLabel: 'Get Jetpack All In',
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
