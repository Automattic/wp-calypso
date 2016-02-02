/**
 * External dependencies
 */
import { Map, fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import ActionTypes from '../action-types';
import { DESERIALIZE, SERIALIZE } from '../../action-types';

export default ( state = Map(), action ) => {
	switch ( action.type ) {
		case ActionTypes.RECEIVE_THEME_DETAILS:
			return state
				.set( action.themeId, Map( {
					name: action.themeName,
					author: action.themeAuthor
				} ) )
		case DESERIALIZE:
			return fromJS( state );
		case SERIALIZE:
			return state.toJS();
	}
	return state;
};
