import { withStorageKey } from '@automattic/state-utils';
import {
	SITE_SYNC_STATUS_SET as SET_STATUS,
	SITE_SYNC_STATUS_REQUEST as REQUEST_STATUS,
	SITE_SYNC_FAILURE as REQUEST_STATUS_FAILURE,
	SITE_SYNC_IS_SYNCING_IN_PROGRESS as IS_SYNCING_IN_PROGRESS,
	SITE_SYNC_TARGET_SITE,
	SITE_SYNC_SOURCE_SITE,
	SITE_SYNC_LAST_RESTORE_ID,
} from 'calypso/state/action-types';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import { SiteSyncStatus, SiteSyncStatusProgress } from './constants';
import { siteSync as schema } from './schema';

export const status = withPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case IS_SYNCING_IN_PROGRESS: {
			if ( action.isSyncingInProgress === false ) {
				return null;
			}
			return state;
		}
		case SET_STATUS:
			return action.status || null;
		case REQUEST_STATUS_FAILURE:
			return SiteSyncStatus.FAILED;
		default:
			return state;
	}
} );

export const lastRestoreId = withPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case SITE_SYNC_LAST_RESTORE_ID:
			return action.lastRestoreId || state;
		default:
			return state;
	}
} );

export const syncingTargetSite = withPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case IS_SYNCING_IN_PROGRESS: {
			if ( action.isSyncingInProgress === false ) {
				return null;
			}
			return state;
		}
		case SITE_SYNC_TARGET_SITE: {
			return action.targetSite || null;
		}
		case REQUEST_STATUS_FAILURE:
			return null;
		default:
			return state;
	}
} );

export const syncingSourceSite = withPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case IS_SYNCING_IN_PROGRESS: {
			if ( action.isSyncingInProgress === false ) {
				return null;
			}
			return state;
		}
		case SITE_SYNC_SOURCE_SITE: {
			return action.sourceSite || null;
		}
		case REQUEST_STATUS_FAILURE:
			return null;
		default:
			return state;
	}
} );

export const error = ( state = null, action ) => {
	switch ( action.type ) {
		case REQUEST_STATUS_FAILURE:
			return action.error;
		case SET_STATUS:
			return null;
		default:
			return state;
	}
};

export const fetchingStatus = ( state = false, action ) => {
	switch ( action.type ) {
		case REQUEST_STATUS:
			return true;
		case SET_STATUS:
			return false;
		case REQUEST_STATUS_FAILURE:
			return false;
		default:
			return state;
	}
};

export const isSyncingInProgress = ( state = false, action ) => {
	switch ( action.type ) {
		case IS_SYNCING_IN_PROGRESS:
			return action.isSyncingInProgress || false;
		case SET_STATUS:
			return ( action.status && action.status !== SiteSyncStatus.COMPLETED ) || false;
		case REQUEST_STATUS_FAILURE:
			return false;
		default:
			return state;
	}
};

export const progress = withPersistence( ( state = 0, action ) => {
	switch ( action.type ) {
		case IS_SYNCING_IN_PROGRESS:
			if ( action.isSyncingInProgress === false ) {
				return 0;
			}
		case REQUEST_STATUS:
			return state;
		case SET_STATUS: {
			let newStatus = state + SiteSyncStatusProgress.DELTA;
			newStatus = Math.min( newStatus, 1 );

			switch ( action.status ) {
				case SiteSyncStatus.PENDING:
					newStatus = Math.max( newStatus, SiteSyncStatusProgress.PENDING );
					break;
				case SiteSyncStatus.BACKUP:
					newStatus = Math.max( newStatus, SiteSyncStatusProgress.BACKUP );
					break;
				case SiteSyncStatus.RESTORE:
					newStatus = Math.max( newStatus, SiteSyncStatusProgress.RESTORE );
					break;
				case SiteSyncStatus.COMPLETED:
					newStatus = Math.max( newStatus, SiteSyncStatusProgress.COMPLETED );
					break;
				case SiteSyncStatus.FAILED:
					newStatus = SiteSyncStatusProgress.FAILED;
					break;
				default:
					return newStatus;
			}
			return newStatus;
		}
		case REQUEST_STATUS_FAILURE:
			return 0;
		default:
			return state;
	}
} );

export const siteReducer = combineReducers( {
	status,
	fetchingStatus,
	progress,
	isSyncingInProgress,
	syncingTargetSite,
	syncingSourceSite,
	lastRestoreId,
	error,
} );

// state is a map of transfer sub-states
// keyed by the associated site id
const validatedReducer = withSchemaValidation( schema, keyedReducer( 'siteId', siteReducer ) );

const siteSyncReducer = withStorageKey( 'siteSync', validatedReducer );

export default siteSyncReducer;
