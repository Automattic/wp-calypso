import { fetchSiteActiveThemes } from '../api/site-themes';
import type { Theme } from '../api/site-themes';

export const siteActiveThemesQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'themes', 'active' ],
	queryFn: () => fetchSiteActiveThemes( siteId ),
} );

export const isSiteUsingBlockThemeQuery = ( siteId: number ) => ( {
	...siteActiveThemesQuery( siteId ),
	select: ( themes: Theme[] ) => {
		return themes[ 0 ]?.is_block_theme ?? false;
	},
} );
