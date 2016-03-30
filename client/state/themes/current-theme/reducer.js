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
	THEME_RECEIVE_CURRENT
} from 'state/action-types';

export const initialState = fromJS( {
	isActivating: false,
	hasActivated: false,
	currentThemes: {}
} );

export default ( state = initialState, action ) => {
	switch ( action.type ) {
		case THEME_RECEIVE_CURRENT:
			return state.setIn( [ 'currentThemes', action.site.ID ], {
				name: action.themeName,
				id: action.themeId,
				cost: action.themeCost
			} );
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
