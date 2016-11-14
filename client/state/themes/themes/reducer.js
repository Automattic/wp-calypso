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
					.set( 'currentSiteId', action.siteId );
			} );
		}
		case DESERIALIZE:
			return initialState;
		case SERVER_DESERIALIZE:
			return fromJS( state );
		case SERIALIZE:
			return {};
	}
	return state;
};
