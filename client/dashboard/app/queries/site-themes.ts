import { queryOptions } from '@tanstack/react-query';
import { fetchSiteActiveThemes } from '../../data/site-themes';

export const siteActiveThemesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'themes', 'active' ],
		queryFn: () => fetchSiteActiveThemes( siteId ),
	} );

export const isSiteUsingBlockThemeQuery = ( siteId: number ) =>
	queryOptions( {
		...siteActiveThemesQuery( siteId ),
		select: ( themes ) => {
			return themes[ 0 ]?.is_block_theme ?? false;
		},
	} );
