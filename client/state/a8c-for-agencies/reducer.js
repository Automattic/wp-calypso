import { withStorageKey } from '@automattic/state-utils';
import agencies from 'calypso/state/a8c-for-agencies/agency/reducer';
import client from 'calypso/state/a8c-for-agencies/client/reducer';
import { combineReducers } from 'calypso/state/utils';

const combinedReducer = combineReducers( {
	agencies,
	client,
} );

export default withStorageKey( 'a8cForAgencies', combinedReducer );
