import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { QueryOptions, UseQueryResult } from 'react-query';

export const useGetEmailDomainsQueryCacheKey = ( siteId: number | null ) => [
	'emails-management/domains',
	siteId,
];

interface Options extends QueryOptions {
	enabled?: boolean;
}

export const useGetEmailDomainsQuery = (
	siteId: number | null,
	queryOptions: Options
): UseQueryResult< { domains: ResponseDomain[] } > => {
	const { enabled = true } = queryOptions;
	return useQuery( useGetEmailDomainsQueryCacheKey( siteId ), () => fetchEmailDomains( siteId ), {
		...queryOptions,
		enabled: !! siteId && enabled,
	} );
};

function fetchEmailDomains( siteId: number | null ): Promise< unknown > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/domains`,
		},
		{ apiVersion: '1.2' }
	);
}
