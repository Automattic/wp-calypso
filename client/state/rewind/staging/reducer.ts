import { AnyAction } from 'redux';
import {
	JETPACK_BACKUP_STAGING_LIST_REQUEST,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE,
	JETPACK_BACKUP_STAGING_UPDATE_REQUEST,
	JETPACK_BACKUP_STAGING_UPDATE_REQUEST_SUCCESS,
	JETPACK_BACKUP_STAGING_UPDATE_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import { BACKUP_STAGING_UPDATE_REQUEST } from './constants';

export const initialState = {
	hasFetchedStagingSitesList: false,
	isFetchingStagingSitesList: false,
	sites: [],
};

export const stagingSitesList = ( state = initialState, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_BACKUP_STAGING_LIST_REQUEST:
			return {
				...state,
				hasFetchedStagingSitesList: false,
				isFetchingStagingSitesList: true,
			};

		case JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS:
			return {
				...state,
				hasFetchedStagingSitesList: true,
				isFetchingStagingSitesList: false,
				sites: action.stagingSitesList,
			};

		case JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE:
			return {
				...state,
				hasFetchedStagingSitesList: false,
				isFetchingStagingSitesList: false,
			};
	}

	return state;
};

export const updateStagingFlagRequestStatus = (
	state = BACKUP_STAGING_UPDATE_REQUEST.UNSUBMITTED,
	action: AnyAction
) => {
	switch ( action.type ) {
		case JETPACK_BACKUP_STAGING_UPDATE_REQUEST:
			return BACKUP_STAGING_UPDATE_REQUEST.PENDING;
		case JETPACK_BACKUP_STAGING_UPDATE_REQUEST_SUCCESS:
			return BACKUP_STAGING_UPDATE_REQUEST.SUCCESS;
		case JETPACK_BACKUP_STAGING_UPDATE_REQUEST_FAILURE:
			return BACKUP_STAGING_UPDATE_REQUEST.FAILED;
	}

	return state;
};

export default combineReducers( {
	stagingSitesList,
	updateStagingFlagRequestStatus,
} );
