/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import ThemeConstants from '../constants';

const initialState = fromJS( {
	previousSiteId: 0,
	currentSiteId: null,
	isJetpack: null,
	lastParams: null,
} );

const reducer = ( state = initialState, payload ) => {
	const { action } = payload;

	// FIXME To fully convert this store to a reducer, we need to remove
	// dependency on the dispatcher (and, by extension, other stores). Will
	// probably be easier to do down the road when we have better
	// infrastructure to accommodate reducers?
	const Dispatcher = require( 'dispatcher' );
	const ThemesListStore = require( '../stores/themes-list' );
	Dispatcher.waitFor( [ ThemesListStore.dispatchToken ] );

	switch ( action.type ) {
		case ThemeConstants.QUERY_THEMES:
			return state.set( 'lastParams', action.params );

		case ThemeConstants.INCREMENT_THEMES_PAGE:
			return state
				.set( 'previousSiteId', state.get( 'currentSiteId' ) )
				.set( 'currentSiteId', action.site.ID )
				.set( 'isJetpack', !! action.site.jetpack );

		case ThemeConstants.SEARCH_THEMES:
			return state.set( 'lastParams', null );
	}
	return state;
};

export { initialState, reducer };
