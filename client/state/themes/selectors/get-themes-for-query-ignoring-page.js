import { createSelector } from '@automattic/state-utils';
import { flatMap } from 'lodash';
import { getSerializedThemesQueryWithoutPage } from 'calypso/state/themes/utils';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import 'calypso/state/themes/init';

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
			const activeThemeId = state.ui
				? state.themes.activeThemes[ getSelectedSiteId( state ) ]
				: null;
			const recommendedThemes = state.themes.recommendedThemes.themes;
			const themeIds = flatMap( recommendedThemes, ( theme ) => theme.id );

			themesForQueryIgnoringPage = themesForQueryIgnoringPage.filter(
				( theme ) => ! themeIds.includes( theme.id )
			);

			if ( activeThemeId ) {
				for ( let i = 0; i < themesForQueryIgnoringPage.length; i++ ) {
					if ( themesForQueryIgnoringPage[ i ].id === activeThemeId ) {
						themesForQueryIgnoringPage.unshift( ...themesForQueryIgnoringPage.splice( i, 1 ) );
						break;
					}
				}
			}
		}

		// FIXME: The themes endpoint weirdly sometimes returns duplicates (spread
		// over different pages) which we need to remove manually here for now.
		return [ ...new Set( themesForQueryIgnoringPage ) ];
	},
	( state ) => state.themes.queries,
	( state, siteId, query ) => getSerializedThemesQueryWithoutPage( query, siteId )
);
