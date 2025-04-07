import { withStorageKey } from '@automattic/state-utils';
import { ACTIVITY_LOG_FILTER_SET, ACTIVITY_LOG_FILTER_UPDATE } from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import { backupRequest, backupProgress, granularBackupDownloadRequested } from './backup/reducer';
import { restoreProgress, restoreRequest } from './restore/reducer';

export const emptyFilter = {
	page: 1,
};

export const filterState = ( state = emptyFilter, { type, filter } ) => {
	switch ( type ) {
		case ACTIVITY_LOG_FILTER_SET:
			return { ...emptyFilter, ...filter };

		case ACTIVITY_LOG_FILTER_UPDATE:
			return { ...state, ...filter };

		default:
			return state;
	}
};

const combinedReducer = combineReducers( {
	filter: keyedReducer( 'siteId', filterState ),
	restoreProgress,
	restoreRequest,
	backupProgress,
	backupRequest,
	granularBackupDownloadRequested,
} );

export default withStorageKey( 'activityLog', combinedReducer );
