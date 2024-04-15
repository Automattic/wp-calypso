import { getFeaturesList } from '@automattic/calypso-products';
import { gridPlans } from './gird-plans';
import { gridPlanForSpotlight } from './grid-plan-for-spotlight';

export const defaultArgs = {
	gridPlans,
	gridPlanForSpotlight,
	generatedWPComSubdomain: {
		isLoading: false,
		result: {},
	},
	isCustomDomainAllowedOnFreePlan: false,
	isInSignup: true,
	isInAdmin: false,
	isLaunchPage: false,
	onUpgradeClick: () => {},
	selectedSiteId: 182283121,
	intervalType: 'yearly',
	hideUnavailableFeatures: false,
	currentSitePlanSlug: undefined,
	planActionOverrides: {},
	intent: 'plans-default-wpcom',
	showLegacyStorageFeature: false,
	showUpgradeableStorage: true,
	stickyRowOffset: 32,
	useCheckPlanAvailabilityForPurchase: () => ( { value_bundle: true } ),
	allFeaturesList: getFeaturesList(),
	onStorageAddOnClick: () => {},
	showRefundPeriod: false,
	recordTracksEvent: () => {},
	planUpgradeCreditsApplicable: 418,
};
