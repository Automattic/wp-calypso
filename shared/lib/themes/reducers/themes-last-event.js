/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import ThemeConstants from 'lib/themes/constants';

const initialState = fromJS( {} );

const reducer = ( state, payload ) => {
	const { action } = payload;

	switch ( action.type ) {
		case ThemeConstants.RECEIVE_THEMES:
			return state
				.set( 'search', {
					name: 'calypso_themeshowcase_search',
					properties: {
						search_term: action.queryParams.search || null,
						tier: action.queryParams.tier,
						response_time_in_ms: action.responseTime,
						result_count: action.found,
						results_first_page: action.themes.map( theme => theme.id )
					}
				} )
				.setIn( [ 'activate', 'properties', 'search_term' ], action.queryParams.search || null );

		case ThemeConstants.ACTIVATED_THEME:
			return state.mergeDeep( { activate: {
				name: 'calypso_themeshowcase_theme_activate',
				properties: {
					theme: action.theme.id,
					previous_theme: action.previousTheme.id,
					source: action.source,
					purchased: action.purchased
				}
			} } );
	}
	return state;
};

export { initialState, reducer };
