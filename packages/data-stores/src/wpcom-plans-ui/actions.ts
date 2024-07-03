import type {
	PlanSlug,
	WPComPlanStorageFeatureSlug,
	WPComStorageAddOnSlug,
} from '@automattic/calypso-products';

export const setShowDomainUpsellDialog = ( show: boolean ) =>
	( {
		type: 'WPCOM_PLANS_UI_DOMAIN_UPSELL_DIALOG_SET_SHOW' as const,
		show,
	} ) as const;

export const resetStore = () =>
	( {
		type: 'WPCOM_PLANS_UI_RESET_STORE',
	} ) as const;

export const setSelectedStorageOptionForPlan = ( {
	addOnSlug,
	planSlug,
	siteId,
}: {
	addOnSlug: WPComStorageAddOnSlug | WPComPlanStorageFeatureSlug;
	planSlug: PlanSlug;
	siteId?: number | null;
} ) =>
	( {
		type: 'WPCOM_PLANS_UI_SET_SELECTED_STORAGE_OPTION_FOR_PLAN',
		addOnSlug,
		planSlug,
		siteId,
	} ) as const;

export type WpcomPlansUIAction = ReturnType<
	typeof setShowDomainUpsellDialog | typeof resetStore | typeof setSelectedStorageOptionForPlan
>;
