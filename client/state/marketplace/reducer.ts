import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import billingInterval from './billing-interval/reducer';
import purchaseFlow from './purchase-flow/reducer';

const combinedReducers = combineReducers( {
	purchaseFlow,
	billingInterval,
} );

export default withStorageKey( 'marketplace', combinedReducers );
