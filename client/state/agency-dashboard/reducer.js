import { withStorageKey } from '@automattic/state-utils';
import sites from 'calypso/state/agency-dashboard/sites/reducer';
import { combineReducers } from 'calypso/state/utils';

const combinedReducer = combineReducers( {
	sites,
} );

export default withStorageKey( 'agencyDashboard', combinedReducer );
