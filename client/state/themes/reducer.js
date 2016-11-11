/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	THEME_ACTIVATE_REQUEST,
	THEME_ACTIVATE_REQUEST_SUCCESS,
	THEME_ACTIVATE_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import themes from './themes/reducer';
import themeDetails from './theme-details/reducer';
import themesList from './themes-list/reducer';
import themesUI from './themes-ui/reducer';

export const activeThemes = createReducer( {}, {
	[ THEME_ACTIVATE_REQUEST_SUCCESS ]: ( state, { siteId, theme } ) => ( {
		...state,
		[ siteId ]: theme.id
	} )
} );

/**
 * Returns the updated theme activation requests state after an action has been
 * dispatched. The state reflects a mapping of site ID, theme ID pairing to a
 * boolean reflecting whether a request for theme activation is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function activationRequests( state = {}, action ) {
	switch ( action.type ) {
		case THEME_ACTIVATE_REQUEST:
		case THEME_ACTIVATE_REQUEST_SUCCESS:
		case THEME_ACTIVATE_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, state[ action.siteId ], {
					[ action.themeId ]: THEME_ACTIVATE_REQUEST === action.type
				} )
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

export default combineReducers( {
	// old reducers, will be gradually retired/rewritten
	themes,
	themeDetails,
	themesList,
	themesUI,
	// new reducers
	activeThemes,
	activationRequests,
	// and maybe completedActivationRequests which can be cleared with a clearActivate action like we had before(?)
} );
