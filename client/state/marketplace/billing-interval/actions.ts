import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { MARKETPLACE_BILLING_INTERVAL_SELECT } from 'calypso/state/action-types';
import type { UnknownAction } from 'redux';
import 'calypso/state/marketplace/init';

export function setBillingInterval(
	interval: IntervalLength.MONTHLY | IntervalLength.ANNUALLY
): UnknownAction {
	return {
		type: MARKETPLACE_BILLING_INTERVAL_SELECT,
		interval,
	};
}
