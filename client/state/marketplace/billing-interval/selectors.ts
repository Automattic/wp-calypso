import 'calypso/state/marketplace/init';
import { IAppState } from 'calypso/state/types';

export function getBillingInterval( state: IAppState ) {
	return state?.marketplace?.billingInterval.interval;
}
