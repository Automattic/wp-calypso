import { createSelector } from '@automattic/state-utils';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

/**
 * Returns the theme software set from taxonomy.
 * @param {Object} state Global state tree
 * @param {string} themeId Theme ID
 * @returns {Object} The theme software set taxonomy.
 */
function getThemeSoftwareSetTaxonomy( state, themeId ) {
	const theme = getTheme( state, 'wpcom', themeId );
	return theme?.taxonomies?.theme_software_set;
}

/**
 * Get the bundled software set of a theme.
 * @param {Object} state Global state tree
 * @param {string} themeId Theme ID
 * @returns {string[]} Array with the name of the softwares.
 */
export const getThemeSoftwareSet = createSelector(
	( state, themeId ) => {
		const themeSoftwareSetTaxonomy = getThemeSoftwareSetTaxonomy( state, themeId );

		if ( ! themeSoftwareSetTaxonomy ) {
			return [];
		}

		return themeSoftwareSetTaxonomy.map( ( item ) => item.slug );
	},
	( state, themeId ) => [ getThemeSoftwareSetTaxonomy( state, themeId ) ]
);
