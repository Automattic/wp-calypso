/**
 * External dependencies
 */
import { noop } from 'lodash';

export const featuresItems = [
	{
		text: 'Static file hosting',
	},
	{
		icon: 'lock',
		text: 'Real-Time Security Bundle',
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
	iconSlug: 'jetpack_anti_spam',
	productName: 'Security Bundle',
	subheadline: 'Get all of the essential security tools',
	description:
		'Enjoy the peace of mind of complete site protection. This bundle includes everything you need to keep your site backed up, free of spam and one-step ahead of threats. Options available: Real-Time or Daily',
	originalPrice: 30,
	billingTimeFrame: 'per month, billed yearly',
	buttonLabel: 'Get the Security Bundle',
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

export const productCardWithProductTypeAndBadgeAndStartingPriceAndDiscount = {
	...productCard,
	productType: 'Real-Time',
	discountedPrice: 25,
	withStartingPrice: true,
	badgeLabel: 'Best value',
};

export const productCardWithLongTexts = {
	...productCard,
	productName: 'Security Bundle Security Bundle Security Bundle',
	subheadline:
		'Get all of the essential security tools. Get all of the essential security tools. Get all of the essential security tools.',
	features: {
		items: [
			...featuresItems,
			{
				icon: 'lock',
				text: 'Real-Time Security Bundle Real-Time Security Bundle Real-Time Security Bundle',
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
