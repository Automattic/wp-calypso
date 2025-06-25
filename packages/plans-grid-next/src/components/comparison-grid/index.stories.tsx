import {
	getFeaturesList,
	getPlanFeaturesGroupedForComparisonGrid,
} from '@automattic/calypso-products';
import { ComparisonGrid, ComparisonGridExternalProps, useGridPlansForComparisonGrid } from '../..';
import type { Meta, StoryObj } from '@storybook/react';

const ComponentWrapper = ( props: Omit< ComparisonGridExternalProps, 'gridPlans' > ) => {
	const gridPlans = useGridPlansForComparisonGrid( {
		eligibleForFreeHostingTrial: true,
		hasRedeemedDomainCredit: undefined,
		hiddenPlans: undefined,
		isDisplayingPlansNeededForFeature: false,
		isInSignup: false,
		isSubdomainNotGenerated: false,
		selectedFeature: undefined,
		selectedPlan: undefined,
		showLegacyStorageFeature: false,
		reflectStorageSelectionInPlanPrices: false,
		term: 'TERM_ANNUALLY',
		useFreeTrialPlanSlugs: undefined,

		// Mirror values from props
		siteId: props.siteId,
		intent: props.intent,
		coupon: props.coupon,
		allFeaturesList: props.allFeaturesList,
		useCheckPlanAvailabilityForPurchase: props.useCheckPlanAvailabilityForPurchase,
	} );

	return (
		gridPlans && (
			<ComparisonGrid
				{ ...props }
				gridPlans={ gridPlans }
				featureGroupMap={ getPlanFeaturesGroupedForComparisonGrid() }
			/>
		)
	);
};

const defaultProps = {
	allFeaturesList: getFeaturesList(),
	coupon: undefined,
	currentSitePlanSlug: undefined,
	featureGroupMap: getPlanFeaturesGroupedForComparisonGrid(),
	hideUnavailableFeatures: false,
	intervalType: 'yearly' as const,
	isInAdmin: false,
	isInSiteDashboard: false,
	isInSignup: true,
	onStorageAddOnClick: () => {},
	planActionOverrides: undefined,
	recordTracksEvent: () => {},
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
};

const meta = {
	title: 'ComparisonGrid',
	component: ComponentWrapper,
} satisfies Meta< typeof ComponentWrapper >;

export default meta;

type Story = StoryObj< typeof meta >;

export const DefaultComparisonGrid = {
	name: 'Default',
	args: {
		...defaultProps,
	},
} satisfies Story;

export const HideUnsupportedFeatures = {
	name: 'Hide unsupported features',
	args: {
		...defaultProps,
		hideUnsupportedFeatures: true,
	},
} satisfies Story;
