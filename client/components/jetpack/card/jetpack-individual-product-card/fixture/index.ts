/**
 * External dependencies
 */
import { noop } from 'lodash';

export const featuresItems = [
	{
		text: 'Automated WordPress backups',
	},
	{
		text: 'One-click restores from desktop or mobile',
	},
];

export const features = {
	items: featuresItems,
};

export const individualProductCard = {
	iconSlug: 'jetpack_backup_v2',
	productName: 'Jetpack Backup',
	subheadline: '',
	description: '',
	currencyCode: 'USD',
	originalPrice: 10,
	billingTimeFrame: 'per month, billed monthly',
	buttonLabel: 'Get Backup',
	onButtonClick: noop,
	features,
};

export const individualProductCardWithBadge = {
	...individualProductCard,
	badgeLabel: 'Best value',
};

export const individualProductCardWithDiscount = {
	...individualProductCard,
	discountedPrice: 8,
	withStartingPrice: true,
};
