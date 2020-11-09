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

export const productCard = {
	iconSlug: 'jetpack_backup_v2',
	productName: 'Jetpack Backup',
	subheadline: '',
	description: '',
	currencyCode: 'USD',
	originalPrice: 10,
	billingTimeFrame: 'per month, billed yearly',
	buttonLabel: 'Get Backup',
	onButtonClick: noop,
	features,
};

export const highlightedProductCard = {
	...productCard,
	isHighlighted: true,
};

export const ownedProductCard = {
	...productCard,
	badgeLabel: 'You own this',
	isOwned: true,
};

export const productCardWithProductTypeAndBadge = {
	...productCard,
	productType: 'Real-Time',
	badgeLabel: 'Best value',
};

export const productCardWithDiscount = {
	...productCard,
	discountedPrice: 25,
	withStartingPrice: true,
	discountMessage: 'Save $100 a year on Backup because you own Scan',
};

export const expandedProductCardWithCategoriesAndMore = {
	...productCard,
	isExpanded: true,
	features: {
		...features,
		more: {
			url: 'https://jetpack.com',
			label: 'And 25 more',
		},
	},
};

export const productCardWithCancelButton = {
	...productCard,
	buttonlabel: 'yes, add real-time Backup',
	cancelLabel: 'No, I do not want Backup',
	onCancelClick: noop,
};
