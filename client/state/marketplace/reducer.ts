import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import billingInterval from './billing-interval/reducer';
import reinstallProducts from './products-reinstall/reducer';
import purchaseFlow from './purchase-flow/reducer';

const combinedReducers = combineReducers( {
	purchaseFlow,
	billingInterval,
	reinstallProducts,
} );

export default withStorageKey( 'marketplace', combinedReducers );
