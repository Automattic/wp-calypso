import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { MARKETPLACE_BILLING_INTERVAL_SELECT } from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { IBillingIntervalState } from '../types';
import { billingIntervalSchema } from './schema';
import type { AnyAction } from 'redux';

export const defaultState: IBillingIntervalState = {
	interval: IntervalLength.MONTHLY,
};

const billingInterval = withSchemaValidation(
	billingIntervalSchema,
	( state = defaultState, action: AnyAction ): IBillingIntervalState => {
		switch ( action.type ) {
			case MARKETPLACE_BILLING_INTERVAL_SELECT:
				return {
					interval: action.interval,
				};
		}

		return state;
	}
);

export default billingInterval;
