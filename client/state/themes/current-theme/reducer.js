/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	SERIALIZE,
	SERVER_DESERIALIZE,
	THEME_ACTIVATE,
	THEME_ACTIVATED,
	THEME_CLEAR_ACTIVATED,
	THEME_RECEIVE_CURRENT,
	THEME_REQUEST_CURRENT,
	THEME_REQUEST_CURRENT_FAILURE,
} from 'state/action-types';

export const initialState = fromJS( {
	isActivating: false,
	hasActivated: false,
	currentThemes: {},
	requesting: {},
} );

export default ( state = initialState, action ) => {
	switch ( action.type ) {
		case THEME_RECEIVE_CURRENT:
			return state.setIn( [ 'currentThemes', action.siteId ], {
				name: action.themeName,
				id: action.themeId,
				cost: action.themeCost,
			} )
			.setIn( [ 'requesting', action.siteId ], false );
		case THEME_REQUEST_CURRENT:
			return state.setIn( [ 'requesting', action.siteId ], true );
		case THEME_REQUEST_CURRENT_FAILURE:
			return state.setIn( [ 'requesting', action.siteId ], false );
		case THEME_ACTIVATE:
			return state.set( 'isActivating', true );
		case THEME_ACTIVATED:
			return state
				.set( 'isActivating', false )
				.set( 'hasActivated', true )
				.setIn( [ 'currentThemes', action.site.ID ], action.theme );
		case THEME_CLEAR_ACTIVATED:
			return state.set( 'hasActivated', false );
		case DESERIALIZE:
			return initialState;
		case SERVER_DESERIALIZE:
			return fromJS( state );
		case SERIALIZE:
			return {};
	}
	return state;
};
