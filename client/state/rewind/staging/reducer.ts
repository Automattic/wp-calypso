import { AnyAction } from 'redux';
import {
	JETPACK_BACKUP_STAGING_LIST_REQUEST,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const initialState = {
	hasFetchedStagingSitesList: false,
	isFetchingStagingSitesList: false,
	stagingSitesList: [],
};

const hasFetchedStagingSitesList = (
	state = initialState.hasFetchedStagingSitesList,
	action: AnyAction
) => {
	switch ( action.type ) {
		case JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS:
			return true;
	}

	return state;
};

const isFetchingStagingSitesList = (
	state = initialState.isFetchingStagingSitesList,
	action: AnyAction
) => {
	switch ( action.type ) {
		case JETPACK_BACKUP_STAGING_LIST_REQUEST:
			return true;
		case JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS:
		case JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE:
			return false;
	}

	return state;
};

const stagingSitesList = ( state = initialState.stagingSitesList, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS:
			return action.stagingSitesList;
	}

	return state;
};

export default combineReducers( {
	hasFetchedStagingSitesList,
	isFetchingStagingSitesList,
	stagingSitesList,
} );
