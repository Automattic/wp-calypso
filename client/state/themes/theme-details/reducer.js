/**
 * External dependencies
 */
import { Map, fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	SERIALIZE,
	SERVER_DESERIALIZE,
	THEME_DETAILS_RECEIVE
} from 'state/action-types';

export default ( state = Map(), action ) => {
	switch ( action.type ) {
		case THEME_DETAILS_RECEIVE:
			return state
				.set( action.themeId, Map( {
					name: action.themeName,
					author: action.themeAuthor,
					price: action.themePrice,
					screenshot: action.themeScreenshot,
					description: action.themeDescription,
					descriptionLong: action.themeDescriptionLong,
					supportDocumentation: action.themeSupportDocumentation,
					taxonomies: action.themeTaxonomies,
					stylesheet: action.themeStylesheet,
				} ) );
		case DESERIALIZE:
			return Map();
		case SERVER_DESERIALIZE:
			return fromJS( state );
		case SERIALIZE:
			return {};
	}
	return state;
};
