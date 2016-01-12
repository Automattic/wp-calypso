/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import ThemeConstants from 'lib/themes/constants';

const initialState = fromJS( {
	isActivating: false,
	hasActivated: false,
	currentThemes: {}
} );

export default ( state = initialState, action ) => {
	switch ( action.type ) {
		case ThemeConstants.RECEIVE_CURRENT_THEME:
			return state.setIn( [ 'currentThemes', action.site.ID ], {
				name: action.themeName,
				id: action.themeId
			} );
		case ThemeConstants.ACTIVATE_THEME:
			return state.set( 'isActivating', true );
		case ThemeConstants.ACTIVATED_THEME:
			return state
				.set( 'isActivating', false )
				.set( 'hasActivated', true )
				.setIn( [ 'currentThemes', action.site.ID ], action.theme );
		case ThemeConstants.CLEAR_ACTIVATED_THEME:
			return state.set( 'hasActivated', false );
	}
	return state;
};
