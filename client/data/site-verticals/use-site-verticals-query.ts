import { useQuery, UseQueryResult, QueryKey } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { SiteVerticalsResponse, SiteVerticalsQueryParams } from './types';

const defaults = {
	term: '',
	limit: 10,
	skip_synonyms: false,
	include_weighted_roots: true,
};

const useSiteVerticalsQuery = (
	fetchOptions: SiteVerticalsQueryParams = {}
): UseQueryResult< SiteVerticalsResponse[] > => {
	const { term } = fetchOptions;

	return useQuery(
		getCacheKey( term || '' ),
		() => fetchSiteVerticals( { ...defaults, ...fetchOptions } ),
		{
			enabled: typeof term === 'string' && term !== '',
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
