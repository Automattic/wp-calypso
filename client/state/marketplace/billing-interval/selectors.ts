import 'calypso/state/marketplace/init';

export function getBillingInterval( state: any ) {
	return state.marketplace.billingInterval.interval;
}
