import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { ResponseDomain } from 'calypso/lib/domains/types';

export const getCacheKey = ( siteId: number | null ) => [ 'sites', siteId, 'domains' ];

type UseGetDomainsQueryData = ResponseDomain[];

export const useGetDomainsQuery = (
	siteId: number | null,
	queryOptions?: Omit< UseQueryOptions< any, unknown, UseGetDomainsQueryData >, 'queryKey' >
) => {
	const enabled = queryOptions?.enabled ?? true;

	return useQuery< any, unknown, UseGetDomainsQueryData >( {
		queryKey: getCacheKey( siteId ),
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/sites/${ siteId }/domains`,
				},
				{ apiVersion: '1.2' }
			),
		select: ( data ) => data.domains,
		...queryOptions,
		enabled: !! siteId && enabled,
	} );
};
