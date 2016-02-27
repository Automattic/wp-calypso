/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import ActionTypes from '../action-types';
import { DESERIALIZE, SERIALIZE, SERVER_DESERIALIZE } from 'state/action-types';
import { isValidStateWithSchema } from 'state/utils';
import { currentThemeSchema } from './schema';

export const initialState = fromJS( {
	isActivating: false,
	hasActivated: false,
	currentThemes: {}
} );

export default ( state = initialState, action ) => {
	switch ( action.type ) {
		case ActionTypes.RECEIVE_CURRENT_THEME:
			return state.setIn( [ 'currentThemes', action.site.ID ], {
				name: action.themeName,
				id: action.themeId,
				cost: action.themeCost
			} );
		case ActionTypes.ACTIVATE_THEME:
			return state.set( 'isActivating', true );
		case ActionTypes.ACTIVATED_THEME:
			return state
				.set( 'isActivating', false )
				.set( 'hasActivated', true )
				.setIn( [ 'currentThemes', action.site.ID ], action.theme );
		case ActionTypes.CLEAR_ACTIVATED_THEME:
			return state.set( 'hasActivated', false );
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, currentThemeSchema ) ) {
				return fromJS( state );
			}
			return initialState;
		case SERVER_DESERIALIZE:
			return fromJS( state );
		case SERIALIZE:
			return state.toJS();
	}
	return state;
};
