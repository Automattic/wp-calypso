import {
	fetchSites,
	fetchPaginatedSites,
	setSiteFavorite,
	SITE_FIELDS,
	SITE_OPTIONS,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type {
	FetchSiteTypes,
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
	FetchPaginatedSitesResponse,
	Site,
} from '@automattic/api-core';

export const sitesQueryKey = [ 'sites', SITE_FIELDS, SITE_OPTIONS ];

export const sitesQuery = (
	siteFilters: FetchSiteTypes,
	fetchSitesOptions: FetchSitesOptions = { site_visibility: 'visible', include_a8c_owned: false }
) => {
	const { source, ...fetchSitesOptionsKey } = fetchSitesOptions;
	return queryOptions( {
		queryKey: [ ...sitesQueryKey, siteFilters, fetchSitesOptionsKey ],
		queryFn: () => fetchSites( siteFilters, fetchSitesOptions ),
	} );
};

export const paginatedSitesQuery = (
	siteFilters: FetchSiteTypes,
	fetchSitesOptions: FetchPaginatedSitesOptions = {
		site_visibility: 'visible',
		include_a8c_owned: false,
	}
) => {
	const { source, ...fetchSitesOptionsKey } = fetchSitesOptions;
	return queryOptions( {
		queryKey: [ ...sitesQueryKey, 'paginated', siteFilters, fetchSitesOptionsKey ],
		queryFn: () => fetchPaginatedSites( siteFilters, fetchSitesOptions ),
	} );
};

export const allSitesQuery = () => sitesQuery( 'all' );

export const hasDeletedSitesQuery = () =>
	queryOptions( {
		...paginatedSitesQuery( 'all', {
			site_visibility: 'deleted',
			include_a8c_owned: false,
			per_page: 1,
		} ),
		select: ( data ) => data.total > 0,
	} );

export const siteFavoriteMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-favorite' },
		mutationFn: ( isFavorited: boolean ) => setSiteFavorite( siteId, isFavorited ),
		onMutate: async ( isFavorited: boolean ) => {
			await queryClient.cancelQueries( { queryKey: sitesQueryKey } );

			const updateSite = ( site: Site ) =>
				site.ID === siteId ? { ...site, is_favorited: isFavorited } : site;

			// `sitesQueryKey` holds both the plain list and the paginated `{ sites, total }` shape.
			queryClient.setQueriesData< Site[] | FetchPaginatedSitesResponse >(
				{ queryKey: sitesQueryKey },
				( data ) => {
					if ( Array.isArray( data ) ) {
						return data.map( updateSite );
					}
					return data?.sites ? { ...data, sites: data.sites.map( updateSite ) } : data;
				}
			);
			queryClient.setQueriesData< Site >( siteQueryFilter( siteId ), ( site ) =>
				site ? updateSite( site ) : site
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries( { queryKey: sitesQueryKey } );
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
		},
	} );
