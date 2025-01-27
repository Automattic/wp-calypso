import { combineReducers } from '@wordpress/data';
import { AnyAction } from 'redux';
import { SITE_LAUNCH, SITE_LAUNCH_SUCCESS, SITE_LAUNCH_FAILURE } from 'calypso/state/action-types';

const addInProgressSiteLaunch = ( state: number[], siteId: number ) => {
	if ( state.includes( siteId ) ) {
		return state;
	}
	return [ ...state, siteId ];
};

const removeInProgressSiteLaunch = ( state: number[], siteId: number ) => {
	return state.filter( ( id ) => id !== siteId );
};

export const siteLaunchesInProgress = ( state: number[] = [], action: AnyAction ) => {
	switch ( action.type ) {
		case SITE_LAUNCH:
			return addInProgressSiteLaunch( state, action.siteId );
		case SITE_LAUNCH_SUCCESS:
		case SITE_LAUNCH_FAILURE:
			return removeInProgressSiteLaunch( state, action.siteId );
		default:
			return state;
	}
};

export default combineReducers( {
	// Add more site launch related reducers here if needed
	inProgress: siteLaunchesInProgress,
} );
