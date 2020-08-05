/**
 * External dependencies
 */
import { noop } from 'lodash';

export const featuresItems = [
	{
		text: 'Backup',
	},
	{
		text: 'Scan',
	},
];

export const features = {
	items: featuresItems,
};

export const legacyCard = {
	iconSlug: 'jetpack_personal',
	productName: 'Jetpack Personal',
	subheadline: 'Best for personal use',
	description:
		'We’re sorry, we’re no longer offering this plan. Your plan is set to expire on 2020-09-15. Please select another plan',
	currencyCode: 'USD',
	originalPrice: 25,
	billingTimeFrame: 'per month, billed monthly',
	buttonLabel: 'This plan is not available for renewal',
	onButtonClick: noop,
	features,
};

export const legacyCardWithBadge = {
	...legacyCard,
	badgeLabel: 'Best value',
};

export const legacyCardWithDiscount = {
	...legacyCard,
	discountedPrice: 20,
	withStartingPrice: true,
};
