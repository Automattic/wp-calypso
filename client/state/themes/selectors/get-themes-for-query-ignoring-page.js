/**
 * External dependencies
 */
import { uniq, flatMap } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import { getSerializedThemesQueryWithoutPage } from 'state/themes/utils';

import 'state/themes/init';

/**
 * Returns an array of normalized themes for the themes query, including all
 * known queried pages, or null if the themes for the query are not known.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {object}  query  Theme query object
 * @returns {?Array}         Themes for the theme query
 */
export const getThemesForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const themes = state.themes.queries[ siteId ];
		if ( ! themes ) {
			return null;
		}

		let themesForQueryIgnoringPage = themes.getItemsIgnoringPage( query );
		if ( ! themesForQueryIgnoringPage ) {
			return null;
		}

		// If query is default, filter out recommended themes.
		if ( ! ( query.search || query.filter || query.tier ) ) {
			const recommendedThemes = state.themes.recommendedThemes.themes;
			const themeIds = flatMap( recommendedThemes, ( theme ) => {
				return theme.id;
			} );
			themesForQueryIgnoringPage = themesForQueryIgnoringPage.filter( ( theme ) => {
				return ! themeIds.includes( theme.id );
			} );
		}

		// FIXME: The themes endpoint weirdly sometimes returns duplicates (spread
		// over different pages) which we need to remove manually here for now.
		return uniq( themesForQueryIgnoringPage );
	},
	( state ) => state.themes.queries,
	( state, siteId, query ) => getSerializedThemesQueryWithoutPage( query, siteId )
);
