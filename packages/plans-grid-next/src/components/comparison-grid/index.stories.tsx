import {
	TrailMapVariantType,
	getFeaturesList,
	getPlanFeaturesGrouped,
	setTrailMapExperiment,
} from '@automattic/calypso-products';
import { Meta, StoryObj } from '@storybook/react';
import { ComparisonGrid, ComparisonGridExternalProps, useGridPlansForComparisonGrid } from '../..';

const ComponentWrapper = (
	props: ComparisonGridExternalProps & {
		trailMapVariant: TrailMapVariantType;
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
				featureGroupMap={ getPlanFeaturesGrouped() }
			/>
		)
	);
};

const defaultProps: Omit< ComparisonGridExternalProps, 'gridPlans' > = {
	allFeaturesList: getFeaturesList(),
	coupon: undefined,
	currentSitePlanSlug: undefined,
	featureGroupMap: getPlanFeaturesGrouped(),
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
			text: '',
			callback: () => {},
			status: '',
		},
		postButtonText: '',
	} ),
};

type Story = StoryObj< typeof ComponentWrapper >;

export const Start: Story = {
	name: '/start',
	args: {
		...defaultProps,
		intent: 'plans-default-wpcom',
	},
};

export const TrailMapControl: Story = {
	args: {
		...Start.args,
		trailMapVariant: 'control',
	},
};

export const TrailMapStructure: Story = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment_structure',
		hideUnsupportedFeatures: true,
	},
};

export const TrailMapCopy: Story = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment_copy',
	},
};

export const TrailMapCopyAndStructure: Story = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment_copy_and_structure',
		hideUnsupportedFeatures: true,
	},
};

const meta: Meta< typeof ComponentWrapper > = {
	title: 'ComparisonGrid',
	component: ComponentWrapper,
	decorators: [
		( Story, storyContext ) => {
			setTrailMapExperiment( storyContext.args.trailMapVariant );
			return <Story />;
		},
	],
};

export default meta;
