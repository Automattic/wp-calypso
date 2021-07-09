/**
 * External dependencies
 */
import { withStorageKey } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';

import purchaseFlow from './purchase-flow/reducer';

const combinedReducers = combineReducers( {
	purchaseFlow,
} );

export default withStorageKey( 'marketplace', combinedReducers );
