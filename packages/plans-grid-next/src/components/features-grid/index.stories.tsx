import {
	getFeaturesList,
	getPlanFeaturesGroupedForFeaturesGrid,
	getPlanFeaturesGroupedForComparisonGrid,
} from '@automattic/calypso-products';
import {
	FeaturesGrid,
	FeaturesGridExternalProps,
	useGridPlanForSpotlight,
	useGridPlansForFeaturesGrid,
} from '../..';
import type { Meta, StoryObj } from '@storybook/react';

const ComponentWrapper = ( props: Omit< FeaturesGridExternalProps, 'gridPlans' > ) => {
	const gridPlans = useGridPlansForFeaturesGrid( {
		eligibleForFreeHostingTrial: true,
		hasRedeemedDomainCredit: undefined,
		hiddenPlans: undefined,
		isDisplayingPlansNeededForFeature: false,
		isSubdomainNotGenerated: false,
		selectedFeature: undefined,
		selectedPlan: undefined,
		reflectStorageSelectionInPlanPrices: false,
		term: 'TERM_ANNUALLY',
		useFreeTrialPlanSlugs: undefined,

		// Mirror values from props
		siteId: props.siteId,
		intent: props.intent,
		coupon: props.coupon,
		allFeaturesList: props.allFeaturesList,
		isInSignup: props.isInSignup,
		showLegacyStorageFeature: props.showLegacyStorageFeature,
		useCheckPlanAvailabilityForPurchase: props.useCheckPlanAvailabilityForPurchase,
	} );

	const gridPlanForSpotlight = useGridPlanForSpotlight( {
		gridPlans,
		siteId: props.siteId,
		intent: props.intent,
		isSpotlightOnCurrentPlan: true,
	} );

	const featureGroupMap = getPlanFeaturesGroupedForFeaturesGrid();

	return (
		gridPlans && (
			<FeaturesGrid
				{ ...props }
				gridPlans={ gridPlans }
				gridPlanForSpotlight={
					'gridPlanForSpotlight' in props ? props.gridPlanForSpotlight : gridPlanForSpotlight
				}
				featureGroupMap={ featureGroupMap }
			/>
		)
	);
};

const defaultProps = {
	allFeaturesList: getFeaturesList(),
	coupon: undefined,
	currentSitePlanSlug: undefined,
	generatedWPComSubdomain: {
		isLoading: false,
		result: { domain_name: 'zzz.wordpress.com' },
	},
	hideUnavailableFeatures: false,
	isCustomDomainAllowedOnFreePlan: false,
	isInAdmin: false,
	isInSignup: true,
	onStorageAddOnClick: () => {},
	planActionOverrides: undefined,
	recordTracksEvent: () => {},
	showLegacyStorageFeature: false,
	showRefundPeriod: false,
	showUpgradeableStorage: true,
	siteId: undefined,
	stickyRowOffset: 0,
	useCheckPlanAvailabilityForPurchase: () => ( {} ),
	useAction: () => ( {
		primary: {
			text: 'test',
			callback: () => {},
			status: 'enabled' as const,
		},
		postButtonText: '',
	} ),
	enableCategorisedFeatures: true,
	enableStorageAsBadge: false,
	enableReducedFeatureGroupSpacing: true,
	enableLogosOnlyForEnterprisePlan: true,
	hideFeatureGroupTitles: true,
};

const meta = {
	title: 'FeaturesGrid',
	component: ComponentWrapper,
} satisfies Meta< typeof ComponentWrapper >;

export default meta;

type Story = StoryObj< typeof meta >;

export const PlansInAdmin = {
	name: 'Default in admin',
	args: {
		...defaultProps,
		intent: 'plans-default-wpcom',
		siteId: 222597060,
		isInAdmin: true,
		isInSignup: false,
	},
} satisfies Story;

export const PlansInSignup = {
	name: 'Default in signup',
	args: {
		...defaultProps,
		intent: 'plans-default-wpcom',
		isInSignup: true,
	},
} satisfies Story;

export const CategorizedFeatures = {
	name: 'Categorized features grid',
	args: {
		...PlansInSignup.args,
		gridPlanForSpotlight: undefined,

		// to better show the effect of the categories, here we use the one from the comparison grid instead
		featureGroupMap: getPlanFeaturesGroupedForComparisonGrid(),
		enableCategorisedFeatures: true,
	},
} satisfies Story;

export const CuratedPlanMixByIntent = {
	name: 'Curated plan mix configured by intent',
	args: {
		...defaultProps,
		intent: 'plans-newsletter',
	},
} satisfies Story;
