/**
 * External dependencies
 */
import { noop } from 'lodash';

export const featuresItems = [
	{
		text: 'Backup',
	},
	{
		icon: 'bug',
		text: 'Anti-spam ',
		description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
	},
];

export const features = {
	items: featuresItems,
};

export const categorizedFeatures = {
	items: {
		Security: featuresItems,
	},
};

export const productCard = {
	iconSlug: 'jetpack_security_v2',
	productName: 'Jetpack Security',
	subheadline: 'Comprehensive WordPress protection',
	description:
		'Enjoy the peace of mind of complete site security. Easy-to-use, powerful security tools guard your site, so you can focus on your business.',
	currencyCode: 'USD',
	originalPrice: 30,
	billingTimeFrame: 'per month, billed yearly',
	buttonLabel: 'Get Jetpack Security',
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
	discountMessage: 'Save $100 a year on Scan because you own backup',
};

export const productCardWithLongTexts = {
	...productCard,
	productName: 'Jetpack Security Jetpack Security Jetpack Security Jetpack Security',
	subheadline:
		'Get all of the essential security tools. Get all of the essential security tools. Get all of the essential security tools.',
	features: {
		items: [
			...featuresItems,
			{
				icon: 'lock',
				text:
					'Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit.',
				description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
			},
		],
	},
};

export const expandedProductCardWithCategoriesAndMore = {
	...productCard,
	isExpanded: true,
	features: {
		...categorizedFeatures,
		more: {
			url: 'https://jetpack.com',
			label: 'And 25 more',
		},
	},
};

export const productCardWithCancelButton = {
	...productCard,
	buttonLabel: 'Yes, add Real-Time Scan',
	cancelLabel: 'No, I do not want Scan',
	onCancelClick: noop,
};
