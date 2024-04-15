import { jetpackFeatures, wpcomFeatures } from './features';

export const gridPlanForSpotlight = {
	planSlug: 'business-bundle',
	isVisible: true,
	tagline: 'Unlock the power of WordPress with plugins and cloud tools.',
	availableForPurchase: false,
	productNameShort: 'Creator',
	planTitle: 'Creator',
	billingTimeframe: 'per month, billed annually',
	current: true,
	isMonthlyPlan: false,
	cartItemForPlan: {
		product_slug: 'business-bundle',
	},
	highlightLabel: 'Your plan',
	pricing: {
		originalPrice: {
			monthly: 3800,
			full: 45600,
		},
		discountedPrice: {
			monthly: null,
			full: null,
		},
		billingPeriod: 365,
		currencyCode: 'AUD',
		expiry: '2025-01-17T00:00:00+00:00',
		introOffer: null,
	},
	storageAddOnsForPlan: [
		{
			productSlug: 'wordpress_com_1gb_space_addon_yearly',
			featureSlugs: [ '50gb-storage-add-on' ],
			icon: null,
			quantity: 50,
			name: '50 GB Storage',
			displayCost: 'A$74.58/month, billed yearly',
			prices: {
				monthlyPrice: 7458.333333333333,
				yearlyPrice: 89500,
				formattedMonthlyPrice: 'A$74.58',
				formattedYearlyPrice: 'A$895',
			},
			description: 'Make more space for high-quality photos, videos, and other media. ',
			featured: false,
			purchased: false,
			checkoutLink: '/checkout/wordpress_com_1gb_space_addon_yearly',
			exceedsSiteStorageLimits: true,
		},
		{
			productSlug: 'wordpress_com_1gb_space_addon_yearly',
			featureSlugs: [ '100gb-storage-add-on' ],
			quantity: 100,
			name: '100 GB Storage',
			displayCost: 'A$124.25/month, billed yearly',
			prices: {
				monthlyPrice: 12425,
				yearlyPrice: 149100,
				formattedMonthlyPrice: 'A$124.25',
				formattedYearlyPrice: 'A$1,491',
			},
			description:
				'Take your site to the next level. Store all your media in one place without worrying about running out of space.',
			featured: false,
			purchased: false,
			checkoutLink: '/checkout/wordpress_com_1gb_space_addon_yearly',
			exceedsSiteStorageLimits: true,
		},
	],
	features: {
		wpcomFeatures,
		jetpackFeatures,
		storageOptions: [
			{
				slug: '50gb-storage',
				isAddOn: false,
			},
			{
				slug: '50gb-storage-add-on',
				isAddOn: true,
			},
			{
				slug: '100gb-storage-add-on',
				isAddOn: true,
			},
		],
	},
};
