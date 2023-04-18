import { AnyAction } from 'redux';
import {
	JETPACK_BACKUP_STAGING_LIST_REQUEST,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';

export const initialState = {
	hasFetchedStagingSitesList: false,
	isFetchingStagingSitesList: false,
	stagingSitesList: [],
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
				stagingSitesList: action.stagingSitesList,
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

export default stagingSitesList;
