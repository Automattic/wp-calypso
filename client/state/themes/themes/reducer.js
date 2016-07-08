/**
 * External dependencies
 */
import { fromJS, Map } from 'immutable';
import transform from 'lodash/transform';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	SERIALIZE,
	SERVER_DESERIALIZE,
	THEME_ACTIVATED,
	THEMES_RECEIVE
} from 'state/action-types';

export const initialState = fromJS( {
	themes: {},
	currentSiteId: 0
} );

function add( newThemes, themes ) {
	return themes.merge( transform( newThemes, ( result, theme ) => {
		result[ theme.id ] = theme;
	}, {} ) );
}

export function setActiveTheme( themeId, themes ) {
	return themes
		.map( theme => theme.delete( 'active' ) )
		.setIn( [ themeId, 'active' ], true );
}

export default ( state = initialState, action ) => {
	switch ( action.type ) {
		case THEMES_RECEIVE:
			const isNewSite = action.isJetpack && ( action.siteId !== state.get( 'currentSiteId' ) );
			return state
				.update( 'themes', themes => isNewSite ? new Map() : themes )
				.set( 'currentSiteId', action.siteId )
				.update( 'themes', add.bind( null, action.themes ) );

		case THEME_ACTIVATED:
			return state.update( 'themes', setActiveTheme.bind( null, action.theme.id ) );
		case DESERIALIZE:
			return initialState;
		case SERVER_DESERIALIZE:
			return fromJS( state );
		case SERIALIZE:
			return {};
	}
	return state;
};
