import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import purchaseFlow from './purchase-flow/reducer';

const combinedReducers = combineReducers( {
	purchaseFlow,
} );

export default withStorageKey( 'marketplace', combinedReducers );
