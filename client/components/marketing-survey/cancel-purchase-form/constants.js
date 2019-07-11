export const CANCEL_FLOW_TYPE = {
	REMOVE: 'remove',
	CANCEL_WITH_REFUND: 'cancel_with_refund',

	// In the end the following two might be merged into one.
	// Before that happens, we still need to distinguish the two.

	// When users effectively cancelling the auto-renewal by
	// cancelling a subscription out of the refund window
	CANCEL_AUTORENEW: 'cancel_autorenew',

	// When users turns off the auto-renewal through a control
	// that is specifically for enabling / disabling auto-renewal.
	// At the moment of writing this, it is a toggle in the purchase management page.
	// It is called 'survey only' because when the survey pops up the auto-renewal
	// will be turned off already for the legal compliance reason, instead of
	// needing users to do any final confirm.
	CANCEL_AUTORENEW_SURVEY_ONLY: 'cancel_autorenew_survey_only',
};
