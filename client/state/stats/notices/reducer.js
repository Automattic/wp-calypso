import { get } from 'lodash';
import {
	STATS_JETPACK_NOTICE_SETTINGS_RECEIVE,
	STATS_JETPACK_NOTICE_SETTINGS_REQUEST,
	STATS_JETPACK_NOTICE_SETTINGS_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case STATS_JETPACK_NOTICE_SETTINGS_RECEIVE:
			return {
				...state,
				[ action.siteId ]: {
					...get( state, [ action.siteId ], {} ),
					...action.data,
				},
			};
	}

	return state;
};

export const isFetching = ( state = false, action ) => {
	switch ( action.type ) {
		case STATS_JETPACK_NOTICE_SETTINGS_REQUEST:
			return true;
		case STATS_JETPACK_NOTICE_SETTINGS_RECEIVE:
			return false;
		case STATS_JETPACK_NOTICE_SETTINGS_FAILURE:
			return false;
	}

	return state;
};

const combinedReducer = combineReducers( {
	isFetching,
	items,
} );

export default combinedReducer;
