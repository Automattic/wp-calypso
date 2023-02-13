import { withStorageKey } from '@automattic/state-utils';
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import backups from './backups/reducer';
import capabilities from './capabilities/reducer';
import policies from './policies/reducer';
import updateBackupRetentionRequestStatus from './retention/reducer';
import size from './size/reducer';
import state from './state/reducer';
import storage from './storage/reducer';

const rewind = combineReducers( {
	backups,
	capabilities,
	policies,
	size,
	state,
	storage,
	updateBackupRetentionRequestStatus,
} );

const reducer = keyedReducer( 'siteId', rewind );

export default withStorageKey( 'rewind', reducer );
