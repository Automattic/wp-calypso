import { GRAVATAR_DETAILS_RECEIVE } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const gravatarDetails = ( state = null, action ) => {
	switch ( action.type ) {
		case GRAVATAR_DETAILS_RECEIVE:
			return action.gravatarDetails;
		default:
			return state;
	}
};

export default combineReducers( {
	gravatarDetails,
} );
