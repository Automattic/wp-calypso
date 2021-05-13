/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import partner from 'calypso/state/partner-portal/partner/reducer';
import licenses from 'calypso/state/partner-portal/licenses/reducer';

const combinedReducer = combineReducers( {
	partner,
	licenses,
} );

export default withStorageKey( 'partnerPortal', combinedReducer );
