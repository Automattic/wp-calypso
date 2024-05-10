import {
	TrailMapVariantType,
	getFeaturesList,
	getPlanFeaturesGrouped,
	setTrailMapExperiment,
} from '@automattic/calypso-products';
import { Meta, StoryObj } from '@storybook/react';
import {
	FeaturesGrid,
	FeaturesGridExternalProps,
	useGridPlanForSpotlight,
	useGridPlansForFeaturesGrid,
} from '../..';

const ComponentWrapper = (
	props: FeaturesGridExternalProps & {
		includePreviousPlanFeatures: boolean;
		trailMapVariant: TrailMapVariantType;
	}
) => {
	const gridPlans = useGridPlansForFeaturesGrid( {
		eligibleForFreeHostingTrial: true,
		hasRedeemedDomainCredit: undefined,
		hiddenPlans: undefined,
		isDisplayingPlansNeededForFeature: false,
		isSubdomainNotGenerated: false,
		selectedFeature: undefined,
		selectedPlan: undefined,
		storageAddOns: [],
		term: 'TERM_ANNUALLY',
		useFreeTrialPlanSlugs: undefined,

		// Mirror values from props
		siteId: props.siteId,
		includePreviousPlanFeatures: props.includePreviousPlanFeatures,
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

	return (
		gridPlans && (
			<FeaturesGrid
				{ ...props }
				gridPlans={ gridPlans }
				gridPlanForSpotlight={
					'gridPlanForSpotlight' in props ? props.gridPlanForSpotlight : gridPlanForSpotlight
				}
				featureGroupMap={ props.enableCategorisedFeatures ? getPlanFeaturesGrouped() : undefined }
			/>
		)
	);
};

const defaultProps: Omit< FeaturesGridExternalProps, 'gridPlans' > = {
	allFeaturesList: getFeaturesList(),
	coupon: undefined,
	currentSitePlanSlug: undefined,
	generatedWPComSubdomain: {
		isLoading: false,
		result: { domain_name: 'zzz.wordpress.com' },
	},
	hideUnavailableFeatures: false,
	intervalType: 'yearly',
	isCustomDomainAllowedOnFreePlan: false,
	isInAdmin: false,
	isInSignup: true,
	onStorageAddOnClick: () => {},
	planActionOverrides: undefined,
	planUpgradeCreditsApplicable: undefined,
	recordTracksEvent: () => {},
	showLegacyStorageFeature: false,
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

export const Plans: Story = {
	name: '/plans',
	args: {
		...defaultProps,
		intent: 'plans-default-wpcom',
		siteId: 222597060,
		isInAdmin: true,
		isInSignup: false,
	},
};

export const Newsletter: Story = {
	name: '/setup/newsletter',
	args: {
		...defaultProps,
		intent: 'plans-newsletter',
	},
};

export const TrailMapControl: Story = {
	args: {
		...Plans.args,
		trailMapVariant: 'control',
		gridPlanForSpotlight: undefined,
	},
};

export const TrailMapStructure: Story = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment_structure',
		enableCategorisedFeatures: true,
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
		enableCategorisedFeatures: true,
	},
};

const meta: Meta< typeof ComponentWrapper > = {
	title: 'FeaturesGrid',
	component: ComponentWrapper,
	decorators: [
		( Story, storyContext ) => {
			setTrailMapExperiment( storyContext.args.trailMapVariant );
			return <Story />;
		},
	],
};

export default meta;
