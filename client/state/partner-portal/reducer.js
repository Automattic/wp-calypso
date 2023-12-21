import { withStorageKey } from '@automattic/state-utils';
import licenses from 'calypso/state/partner-portal/licenses/reducer';
import partner from 'calypso/state/partner-portal/partner/reducer';
import storedCards from 'calypso/state/partner-portal/stored-cards/reducer';
import { combineReducers } from 'calypso/state/utils';

const combinedReducer = combineReducers( {
	partner,
	licenses,
	storedCards,
} );

export default withStorageKey( 'partnerPortal', combinedReducer );
