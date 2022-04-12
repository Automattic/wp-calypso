import { useQuery, UseQueryOptions, UseQueryResult, QueryKey } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { SiteVerticalsResponse, SiteVerticalsQueryParams } from './types';

const defaults = {
	term: '',
	limit: 10,
	skip_synonyms: false,
};

const useSiteVerticalsQuery = (
	fetchOptions: SiteVerticalsQueryParams = {},
	{ enabled = false }: UseQueryOptions = {}
): UseQueryResult< SiteVerticalsResponse[] > => {
	return useQuery(
		getCacheKey( fetchOptions.term || '' ),
		() => fetchSiteVerticals( { ...defaults, ...fetchOptions } ),
		{
			enabled,
			staleTime: Infinity,
			refetchInterval: false,
			refetchOnMount: 'always',
		}
	);
};

export function fetchSiteVerticals(
	params: SiteVerticalsQueryParams
): Promise< SiteVerticalsResponse[] > {
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: '/site-verticals',
		},
		params
	);
}

export function getCacheKey( term: string ): QueryKey {
	return [ 'site-verticals', term ];
}

export default useSiteVerticalsQuery;
