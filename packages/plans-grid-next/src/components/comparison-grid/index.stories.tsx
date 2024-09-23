import {
	getFeaturesList,
	getPlanFeaturesGroupedForComparisonGrid,
	setSimplifiedFeaturesGridExperimentVariant,
	type SimplifiedFeaturesGridExperimentVariant,
} from '@automattic/calypso-products';
import { ComparisonGrid, ComparisonGridExternalProps, useGridPlansForComparisonGrid } from '../..';
import type { Meta, StoryObj } from '@storybook/react';

const ComponentWrapper = (
	props: Omit< ComparisonGridExternalProps, 'gridPlans' > & {
		simplifiedFeaturesGridExperimentVariant?: SimplifiedFeaturesGridExperimentVariant;
	}
) => {
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
		storageAddOns: [],
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
	intervalType: 'yearly',
	isInAdmin: false,
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
	decorators: [
		( Story, { args: { simplifiedFeaturesGridExperimentVariant = 'control' } } ) => {
			setSimplifiedFeaturesGridExperimentVariant( simplifiedFeaturesGridExperimentVariant );
			return <Story />;
		},
	],
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

export const FewerFeaturesExperimentTreatmentVariantA = {
	name: 'Experiment [Simplified features grid]: Treatment A',
	args: {
		...defaultProps,
		simplifiedFeaturesGridExperimentVariant: 'fix_inaccuracies',
	},
} satisfies Story;

export const FewerFeaturesExperimentTreatmentVariantB = {
	name: 'Experiment [Simplified features grid]: Treatment B',
	args: {
		...defaultProps,
		simplifiedFeaturesGridExperimentVariant: 'simplified',
	},
} satisfies Story;
