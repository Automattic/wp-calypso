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
	THEME_ACTIVATE_REQUEST_SUCCESS,
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
		case THEMES_RECEIVE: {
			const isCurrentSite = action.siteId === state.get( 'currentSiteId' );
			const isNewSite = action.isJetpack && ! isCurrentSite;
			const currentThemes = isNewSite ? new Map() : state.get( 'themes' );
			const mergedThemes = add( action.themes, currentThemes );

			return state.withMutations( ( temporaryState ) => {
				temporaryState
					.set( 'themes', mergedThemes )
					.set( 'currentSiteId', action.siteId )
			} );
		}
		case THEME_ACTIVATE_REQUEST_SUCCESS:
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
