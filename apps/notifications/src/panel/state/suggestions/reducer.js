import { combineReducers } from 'redux';

import * as types from '../action-types';

export const bySite = ( state = {}, { type, siteId, suggestions } ) => {
	if ( types.SUGGESTIONS_STORE === type ) {
		return {
			...state,
			[ siteId ]: suggestions,
		};
	}

	return state;
};

export default combineReducers( {
	bySite,
} );
