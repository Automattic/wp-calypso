import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { UseQueryResult } from 'react-query';

export const getEmailsManagementDomainsQueryCacheKey = ( siteId: number ) => [
	'emails-management/domains',
	siteId,
];

export const useGetEmailDomainsQuery = (
	siteId: number,
	queryOptions = {}
): UseQueryResult< { domains: ResponseDomain[] } > => {
	return useQuery(
		getEmailsManagementDomainsQueryCacheKey( siteId ),
		() =>
			wpcom.req.get(
				{
					path: `/sites/${ siteId }/domains`,
				},
				{ apiVersion: '1.2' }
			),
		queryOptions
	);
};
