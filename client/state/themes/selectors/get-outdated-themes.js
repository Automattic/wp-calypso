import 'calypso/state/themes/init';
import { createSelector } from '@automattic/state-utils';

/**
 * Returns the Themes that need to be updated.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {object}         Last query
 */
export const getOutdatedThemes = createSelector(
	( state, siteId ) => {
		const themes = state.themes.queries[ siteId ];
		if ( ! themes ) {
			return [];
		}
		return ( themes.getItemsIgnoringPage( {} ) || [] ).filter( ( theme ) => theme.update );
	},
	( state ) => state.themes.queries
);
