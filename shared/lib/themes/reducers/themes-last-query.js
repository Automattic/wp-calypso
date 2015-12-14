/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import ThemeConstants from '../constants';

export const initialState = fromJS( {
	previousSiteId: 0,
	currentSiteId: null,
	isJetpack: null,
	lastParams: null,
} );

export const reducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case ThemeConstants.QUERY_THEMES:
			return state.set( 'lastParams', action.params );

		case ThemeConstants.INCREMENT_THEMES_PAGE:
			return state
				.set( 'previousSiteId', state.get( 'currentSiteId' ) )
				.set( 'currentSiteId', action.site.ID )
				.set( 'isJetpack', !! action.site.jetpack );
	}

	return state;
};

export function hasSiteChanged( state ) {
	return state.get( 'previousSiteId' ) !== state.get( 'currentSiteId' );
};

export function hasParams( state ) {
	return !! state.get( 'lastParams' );
}
