import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { UseQueryOptions } from 'react-query';

export const getCacheKey = ( siteId: number | null ) => [ 'sites', siteId, 'domains' ];

export type Domain = {
	domain: string;
	registration_date: string;
};
type UseGetDomainsQueryData = Domain[];

export const useGetDomainsQuery = (
	siteId: number | null,
	queryOptions?: UseQueryOptions< any, unknown, UseGetDomainsQueryData >
) => {
	const enabled = queryOptions?.enabled ?? true;

	return useQuery< any, unknown, UseGetDomainsQueryData >(
		getCacheKey( siteId ),
		() =>
			wpcom.req.get(
				{
					path: `/sites/${ siteId }/domains`,
				},
				{ apiVersion: '1.2' }
			),
		{
			select: ( data ) => data.domains,
			...queryOptions,
			enabled: !! siteId && enabled,
		}
	);
};
