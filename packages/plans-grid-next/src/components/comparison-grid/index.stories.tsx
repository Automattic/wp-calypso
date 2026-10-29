import {
	getFeaturesList,
	getPlanFeaturesGroupedForComparisonGrid,
} from '@automattic/calypso-products';
import {
	ComparisonGrid,
	ComparisonGridExternalProps,
	hasTailoredFeatureList,
	useGridPlansForComparisonGrid,
} from '../..';
import type { PlansIntent } from '../..';
import type { Meta, StoryObj } from '@storybook/react';

// The groups have to match the feature lists the grid builds for the intent.
const getFeatureGroupMap = ( intent?: PlansIntent ) =>
	getPlanFeaturesGroupedForComparisonGrid( {
		isExperimentVariant: ! hasTailoredFeatureList( intent ),
	} );

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
				featureGroupMap={ getFeatureGroupMap( props.intent ) }
			/>
		)
	);
};

const defaultProps = {
	allFeaturesList: getFeaturesList(),
	coupon: undefined,
	currentSitePlanSlug: undefined,
	featureGroupMap: getFeatureGroupMap(),
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
