import {
	TrailMapVariantType,
	getFeaturesList,
	getPlanFeaturesGrouped,
	setTrailMapExperiment,
} from '@automattic/calypso-products';
import {
	FeaturesGrid,
	FeaturesGridExternalProps,
	useGridPlanForSpotlight,
	useGridPlansForFeaturesGrid,
} from '../..';
import type { Meta, StoryObj } from '@storybook/react';

const ComponentWrapper = (
	props: Omit< FeaturesGridExternalProps, 'gridPlans' > & {
		trailMapVariant?: TrailMapVariantType;
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

const defaultProps = {
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
			text: 'test',
			callback: () => {},
			status: 'enabled' as const,
		},
		postButtonText: '',
	} ),
};

const meta = {
	title: 'FeaturesGrid',
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

export const Plans = {
	name: '/plans',
	args: {
		...defaultProps,
		intent: 'plans-default-wpcom',
		siteId: 222597060,
		isInAdmin: true,
		isInSignup: false,
	},
} satisfies Story;

export const Newsletter = {
	name: '/setup/newsletter',
	args: {
		...defaultProps,
		intent: 'plans-newsletter',
	},
} satisfies Story;

export const TrailMapControl = {
	args: {
		...Plans.args,
		trailMapVariant: 'control',
		gridPlanForSpotlight: undefined,
	},
} satisfies Story;

export const TrailMapStructure = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment_structure',
		enableCategorisedFeatures: true,
	},
} satisfies Story;

export const TrailMapCopy = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment_copy',
	},
} satisfies Story;

export const TrailMapCopyAndStructure = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment_copy_and_structure',
		enableCategorisedFeatures: true,
	},
} satisfies Story;
