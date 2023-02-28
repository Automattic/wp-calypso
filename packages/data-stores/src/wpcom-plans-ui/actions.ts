export const setShowDomainUpsellDialog = ( show: boolean ) =>
	( {
		type: 'WPCOM_PLANS_UI_DOMAIN_UPSELL_DIALOG_SET_SHOW' as const,
		show,
	} as const );

export const resetStore = () =>
	( {
		type: 'WPCOM_PLANS_UI_RESET_STORE',
	} as const );

export type WpcomPlansUIAction = ReturnType< typeof setShowDomainUpsellDialog | typeof resetStore >;
