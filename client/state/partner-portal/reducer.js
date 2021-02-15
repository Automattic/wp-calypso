/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import partner from 'calypso/state/partner-portal/partner/reducer';

const combinedReducer = combineReducers( {
	partner,
} );

export default withStorageKey( 'partnerPortal', combinedReducer );
