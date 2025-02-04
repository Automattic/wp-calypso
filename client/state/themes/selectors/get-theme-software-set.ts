import { createSelector } from '@automattic/state-utils';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import type { AppState, ThemeSoftwareSet } from 'calypso/types';

import 'calypso/state/themes/init';

/**
 * Returns the theme software set from taxonomy.
 */
function getThemeSoftwareSetTaxonomy( state: AppState, themeId: string ): ThemeSoftwareSet[] {
	const theme = getTheme( state, 'wpcom', themeId );
	return theme?.taxonomies?.theme_software_set;
}

/**
 * Get the bundled software set slugs of a theme.
 */
export const getThemeSoftwareSet = createSelector(
	( state: AppState, themeId: string ): string[] => {
		const themeSoftwareSetTaxonomy = getThemeSoftwareSetTaxonomy( state, themeId );

		if ( ! themeSoftwareSetTaxonomy ) {
			return [];
		}

		return themeSoftwareSetTaxonomy.map( ( item ) => item.slug );
	},
	( state: AppState, themeId: string ) => [ getThemeSoftwareSetTaxonomy( state, themeId ) ]
);
