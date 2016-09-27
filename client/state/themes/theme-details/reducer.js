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
	THEME_ACTIVATED,
	THEME_DETAILS_RECEIVE,
	THEME_DETAILS_RECEIVE_FAILURE,
} from 'state/action-types';
import { setActiveTheme } from '../themes/reducer';

export default ( state = Map(), action ) => {
	switch ( action.type ) {
		case THEME_DETAILS_RECEIVE:
			return state
				.set( action.themeId, Map( {
					name: action.themeName,
					author: action.themeAuthor,
					price: action.themePrice,
					screenshot: action.themeScreenshot,
					screenshots: action.themeScreenshots,
					description: action.themeDescription,
					descriptionLong: action.themeDescriptionLong,
					supportDocumentation: action.themeSupportDocumentation,
					download: action.themeDownload,
					taxonomies: action.themeTaxonomies,
					stylesheet: action.themeStylesheet,
					demo_uri: action.themeDemoUri,
					active: action.themeActive,
					purchased: action.themePurchased,
				} ) );
		case THEME_DETAILS_RECEIVE_FAILURE:
			return state.set( action.themeId, Map( { error: action.error } ) );
		case THEME_ACTIVATED:
			return state.update( setActiveTheme.bind( null, action.theme.id ) );
		case DESERIALIZE:
			return Map();
		case SERVER_DESERIALIZE:
			return fromJS( state );
		case SERIALIZE:
			return {};
	}
	return state;
};
