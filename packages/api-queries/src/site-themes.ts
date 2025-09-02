import { fetchSiteActiveThemes } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

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
