import { MARKETPLACE_BILLING_INTERVAL_SELECT } from 'calypso/state/action-types';

import 'calypso/state/marketplace/init';

export function setBillingInterval( interval: any ) {
	return {
		type: MARKETPLACE_BILLING_INTERVAL_SELECT,
		interval,
	};
}
