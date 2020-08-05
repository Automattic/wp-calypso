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

export const bundleCard = {
	iconSlug: 'jetpack_security_v2',
	productName: 'Jetpack Security',
	subheadline: 'Comprehensive WordPress protection',
	description:
		'Enjoy the peace of mind of complete site security. Easy-to-use, powerful security tools guard your site, so you can focus on your business.',
	currencyCode: 'USD',
	originalPrice: 25,
	billingTimeFrame: 'per month, billed monthly',
	buttonLabel: 'Get Jetpack Security',
	onButtonClick: noop,
	features,
};

export const bundleCardWithBadge = {
	...bundleCard,
	badgeLabel: 'Best value',
};

export const bundleCardWithDiscount = {
	...bundleCard,
	discountedPrice: 20,
	withStartingPrice: true,
};
