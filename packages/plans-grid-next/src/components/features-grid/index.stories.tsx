import { Meta } from '@storybook/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { FeaturesGrid } from '../..';

const queryClient = new QueryClient();

const wpcomFeatures = [
	{
		getSlug: () => {},
		getTitle: () => 'Dotcom Feature 1',
		availableForCurrentPlan: true,
	},
	{
		getSlug: () => {},
		getTitle: () => 'Dotcom Feature 2',
		availableForCurrentPlan: true,
	},
	{
		getSlug: () => {},
		getTitle: () => 'Dotcom Feature 3',
		availableForCurrentPlan: true,
	},
];

const jetpackFeatures = [
	{
		getSlug: () => {},
		getTitle: () => 'Jetpack Feature 1',
		availableForCurrentPlan: true,
	},
	{
		getSlug: () => {},
		getTitle: () => 'Jetpack Feature 2',
		availableForCurrentPlan: true,
	},
	{
		getSlug: () => {},
		getTitle: () => 'Jetpack Feature 3',
		availableForCurrentPlan: true,
	},
];

export default {
	title: 'plans-grid-next',
	component: FeaturesGrid,
	decorators: [
		( Story ) => (
			<QueryClientProvider client={ queryClient }>
				<Story />
			</QueryClientProvider>
		),
	],
	parameters: {
		viewport: {
			defaultViewport: 'LARGE',
		},
	},
} as Meta;

const defaultArgs = {
	gridPlans: [
		{
			planSlug: 'free_plan',
			isVisible: true,
			tagline: 'Get a taste of the world’s most popular CMS & blogging software.',
			availableForPurchase: false,
			productNameShort: 'Free',
			planTitle: 'Free',
			billingTimeframe: 'No expiration date',
			current: false,
			isMonthlyPlan: true,
			cartItemForPlan: null,
			highlightLabel: null,
			pricing: {
				originalPrice: {
					monthly: 0,
					full: 0,
				},
				discountedPrice: {
					monthly: null,
					full: null,
				},
				billingPeriod: -1,
				currencyCode: 'AUD',
				introOffer: null,
			},
			storageAddOnsForPlan: null,
			features: {
				wpcomFeatures,
				jetpackFeatures,
				storageOptions: [
					{
						slug: '1gb-storage',
						isAddOn: false,
					},
				],
			},
		},
		{
			planSlug: 'personal-bundle',
			isVisible: true,
			tagline: 'Create your home on the web with a custom domain name.',
			availableForPurchase: false,
			productNameShort: 'Starter',
			planTitle: 'Starter',
			billingTimeframe: 'per month, billed annually',
			current: false,
			isMonthlyPlan: false,
			cartItemForPlan: {
				product_slug: 'personal-bundle',
			},
			highlightLabel: null,
			pricing: {
				originalPrice: {
					monthly: 600,
					full: 7200,
				},
				discountedPrice: {
					monthly: null,
					full: null,
				},
				billingPeriod: 365,
				currencyCode: 'AUD',
				introOffer: null,
			},
			storageAddOnsForPlan: null,
			features: {
				wpcomFeatures,
				jetpackFeatures,
				storageOptions: [
					{
						slug: '6gb-storage',
						isAddOn: false,
					},
				],
			},
		},
		{
			planSlug: 'value_bundle',
			isVisible: true,
			tagline: 'Build a unique website with powerful design tools.',
			availableForPurchase: false,
			productNameShort: 'Explorer',
			planTitle: 'Explorer',
			billingTimeframe: 'per month, billed annually',
			current: false,
			isMonthlyPlan: false,
			cartItemForPlan: {
				product_slug: 'value_bundle',
			},
			highlightLabel: null,
			pricing: {
				originalPrice: {
					monthly: 1200,
					full: 14400,
				},
				discountedPrice: {
					monthly: null,
					full: null,
				},
				billingPeriod: 365,
				currencyCode: 'AUD',
				introOffer: null,
			},
			storageAddOnsForPlan: null,
			features: {
				wpcomFeatures,
				jetpackFeatures,
				storageOptions: [
					{
						slug: '13gb-storage',
						isAddOn: false,
					},
				],
			},
		},
		{
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
		},
		{
			planSlug: 'ecommerce-bundle',
			isVisible: true,
			tagline: 'Create a powerful online store with built-in premium extensions.',
			availableForPurchase: true,
			productNameShort: 'Entrepreneur',
			planTitle: 'Entrepreneur',
			billingTimeframe: 'per month, billed annually',
			current: false,
			isMonthlyPlan: false,
			cartItemForPlan: {
				product_slug: 'ecommerce-bundle',
			},
			highlightLabel: null,
			pricing: {
				originalPrice: {
					monthly: 6800,
					full: 81600,
				},
				discountedPrice: {
					monthly: 3316.67,
					full: 39800,
				},
				billingPeriod: 365,
				currencyCode: 'AUD',
				introOffer: null,
			},
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
		},
		{
			planSlug: 'plan-enterprise-grid-wpcom',
			isVisible: true,
			tagline:
				'Deliver an unmatched performance with the highest security standards on our enterprise content platform.',
			availableForPurchase: false,
			productNameShort: 'enterprise',
			planTitle: 'Enterprise',
			billingTimeframe: '',
			current: false,
			isMonthlyPlan: true,
			cartItemForPlan: null,
			highlightLabel: null,
			pricing: {
				originalPrice: {
					monthly: null,
					full: null,
				},
				discountedPrice: {
					monthly: null,
					full: null,
				},
			},
			storageAddOnsForPlan: null,
			features: {
				wpcomFeatures: [],
				jetpackFeatures: [],
				storageOptions: [],
			},
		},
	],
	gridPlanForSpotlight: {
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
	},
	generatedWPComSubdomain: {
		isLoading: false,
		result: {},
	},
	isCustomDomainAllowedOnFreePlan: false,
	isInSignup: false,
	isInAdmin: true,
	isLaunchPage: false,
	onUpgradeClick: () => {},
	selectedSiteId: 182283121,
	intervalType: 'yearly',
	hideUnavailableFeatures: false,
	currentSitePlanSlug: 'business-bundle',
	planActionOverrides: {
		currentPlan: {},
	},
	intent: 'plans-default-wpcom',
	showLegacyStorageFeature: false,
	showUpgradeableStorage: true,
	stickyRowOffset: 32,
	useCheckPlanAvailabilityForPurchase: () => ( { value_bundle: true } ),
	allFeaturesList: {},
	onStorageAddOnClick: () => {},
	showRefundPeriod: false,
	recordTracksEvent: () => {},
	planUpgradeCreditsApplicable: 418,
};

const storyDefaults = {
	args: defaultArgs,
};

export const FeaturesGridTest = {
	...storyDefaults,
};
