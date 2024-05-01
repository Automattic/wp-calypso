import { getFeaturesList } from '@automattic/calypso-products';

export const defaultArgs = {
	generatedWPComSubdomain: {
		isLoading: false,
		result: { domain_name: '' },
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
	showLegacyStorageFeature: false,
	showUpgradeableStorage: true,
	stickyRowOffset: 0,
	useCheckPlanAvailabilityForPurchase: () => ( { value_bundle: true } ),
	allFeaturesList: getFeaturesList(),
	onStorageAddOnClick: () => {},
	showRefundPeriod: false,
	recordTracksEvent: () => {},
	planUpgradeCreditsApplicable: 418,
	useActionCallback: () => () => {},
};
