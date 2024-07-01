import {
	TrailMapVariantType,
	getFeaturesList,
	getPlanFeaturesGroupedForComparisonGrid,
	setTrailMapExperiment,
} from '@automattic/calypso-products';
import { ComparisonGrid, ComparisonGridExternalProps, useGridPlansForComparisonGrid } from '../..';
import type { Meta, StoryObj } from '@storybook/react';

const ComponentWrapper = (
	props: Omit< ComparisonGridExternalProps, 'gridPlans' > & {
		trailMapVariant?: TrailMapVariantType;
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
	planUpgradeCreditsApplicable: undefined,
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
		( Story, { args: { trailMapVariant } } ) => {
			trailMapVariant && setTrailMapExperiment( trailMapVariant );
			return <Story />;
		},
	],
} satisfies Meta< typeof ComponentWrapper >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Start = {
	name: '/start',
	args: {
		...defaultProps,
		intent: 'plans-default-wpcom',
	},
} satisfies Story;

export const TrailMapControl = {
	args: {
		...Start.args,
		trailMapVariant: 'control',
	},
} satisfies Story;

export const TrailMapCopyAndStructure = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment',
		hideUnsupportedFeatures: true,
	},
} satisfies Story;
