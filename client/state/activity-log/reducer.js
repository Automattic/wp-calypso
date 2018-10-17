/** @format */
/**
 * Internal dependencies
 */
import {
	ACTIVITY_LOG_FILTER_SET,
	ACTIVITY_LOG_FILTER_UPDATE,
	REWIND_CLONE,
} from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';
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

const cloneDestination = ( state = null, { type, payload } ) => {
	switch ( type ) {
		case REWIND_CLONE:
			const { destinationSiteName, destinationSiteUrl } = payload;
			return { destinationSiteName, destinationSiteUrl };
		default:
			return state;
	}
};

export default combineReducers( {
	activationRequesting,
	cloneDestinination: keyedReducer( 'siteId', cloneDestination ),
	filter: keyedReducer( 'siteId', filterState ),
	restoreProgress,
	restoreRequest,
	backupProgress,
	backupRequest,
} );
