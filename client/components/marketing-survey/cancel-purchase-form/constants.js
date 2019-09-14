export const CANCEL_FLOW_TYPE = {
	REMOVE: 'remove',
	CANCEL_WITH_REFUND: 'cancel_with_refund',

	// In the end the following two might be merged into one.
	// Before that happens, we still need to distinguish the two.

	// When users effectively cancelling the auto-renewal by
	// cancelling a subscription out of the refund window
	CANCEL_AUTORENEW: 'cancel_autorenew',
};
