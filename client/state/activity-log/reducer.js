/**
 * Internal dependencies
 */
import { ACTIVITY_LOG_FILTER_SET, ACTIVITY_LOG_FILTER_UPDATE } from 'calypso/state/action-types';
import { combineReducers, keyedReducer, withStorageKey } from 'calypso/state/utils';
import { activationRequesting } from './activation/reducer';
import { restoreProgress, restoreRequest } from './restore/reducer';
import { backupRequest, backupProgress } from './backup/reducer';

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
	activationRequesting,
	filter: keyedReducer( 'siteId', filterState ),
	restoreProgress,
	restoreRequest,
	backupProgress,
	backupRequest,
} );

export default withStorageKey( 'activityLog', combinedReducer );
