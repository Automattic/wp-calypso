import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import wpcom from 'calypso/lib/wp';
import { THEME_STATUS } from '../types';
import type {
	AggregatedTheme,
	SiteThemesApiResponse,
	ThemeSiteInstance,
	ThemesDashboardSite,
} from '../types';

export default function useFetchAllSitesThemes( sites: ThemesDashboardSite[] ) {
	const { siteThemes, isLoading } = useQueries( {
		queries: sites.map( ( site ) => ( {
			queryKey: [ 'a4a-site-themes', site.ID ],
			queryFn: (): Promise< SiteThemesApiResponse > =>
				wpcom.req.get( `/sites/${ site.ID }/themes`, { apiVersion: '1' } ),
			staleTime: 1000 * 60 * 5,
			refetchOnWindowFocus: false,
			retry: 1,
		} ) ),
		combine: ( results ) => ( {
			siteThemes: results.map( ( result ) => result.data ),
			isLoading: results.some( ( result ) => result.isLoading ),
		} ),
	} );

	const themes = useMemo( () => {
		const byThemeId = new Map< string, AggregatedTheme >();

		siteThemes.forEach( ( response, index ) => {
			const site = sites[ index ];
			if ( ! site || ! response?.themes ) {
				return;
			}

			response.themes.forEach( ( theme ) => {
				let aggregated = byThemeId.get( theme.id );
				if ( ! aggregated ) {
					aggregated = {
						id: theme.id,
						name: theme.name,
						author: theme.author,
						screenshot: theme.screenshot,
						status: [],
						sites: [],
						pendingUpdates: [],
					};
					byThemeId.set( theme.id, aggregated );
				} else if ( ! aggregated.screenshot && theme.screenshot ) {
					aggregated.screenshot = theme.screenshot;
				}

				const instance: ThemeSiteInstance = {
					siteId: site.ID,
					siteTitle: site.title || site.URL,
					siteUrl: site.URL,
					version: theme.version,
					active: theme.active,
					newVersion: theme.update?.new_version ?? null,
				};

				aggregated.sites.push( instance );
				if ( instance.newVersion ) {
					aggregated.pendingUpdates.push( instance );
				}
			} );
		} );

		byThemeId.forEach( ( theme ) => {
			theme.status = [
				theme.sites.some( ( site ) => site.active ) ? THEME_STATUS.ACTIVE : THEME_STATUS.INACTIVE,
				...( theme.pendingUpdates.length ? [ THEME_STATUS.UPDATE ] : [] ),
			];
		} );

		return Array.from( byThemeId.values() ).sort( ( a, b ) => a.name.localeCompare( b.name ) );
	}, [ siteThemes, sites ] );

	return { themes, isLoading };
}
