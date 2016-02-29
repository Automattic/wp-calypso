/**
 * External dependencies
 */
import { Map, fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import ActionTypes from '../action-types';
import { DESERIALIZE, SERIALIZE, SERVER_DESERIALIZE } from '../../action-types';
import { themeDetailsSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

export default ( state = Map(), action ) => {
	switch ( action.type ) {
		case ActionTypes.RECEIVE_THEME_DETAILS:
			return state
				.set( action.themeId, Map( {
					name: action.themeName,
					author: action.themeAuthor
				} ) );
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, themeDetailsSchema ) ) {
				return fromJS( state );
			}
			return Map();
		case SERVER_DESERIALIZE:
			return fromJS( state );
		case SERIALIZE:
			return state.toJS();
	}
	return state;
};
