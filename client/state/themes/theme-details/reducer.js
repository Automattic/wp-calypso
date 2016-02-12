/**
 * External dependencies
 */
import { Map, fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import ActionTypes from '../action-types';
import { DESERIALIZE, SERIALIZE, SERVER_DESERIALIZE } from '../../action-types';

export default ( state = Map(), action ) => {
	switch ( action.type ) {
		case ActionTypes.RECEIVE_THEME_DETAILS:
			return state
				.set( action.themeId, Map( {
					name: action.themeName,
					author: action.themeAuthor,
					price: action.themePrice,
					screenshot: action.themeScreenshot,
					description: action.themeDescription,
					descriptionLong: action.themeDescriptionLong,
					supportDocumentation: action.themeSupportDocumentation,
				} ) );
		case DESERIALIZE:
		case SERVER_DESERIALIZE:
			return fromJS( state );
		case SERIALIZE:
			return state.toJS();
	}
	return state;
};
