import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export const getEmailsManagementDomainsQueryCacheKey = ( siteId: number ) => [
	'emails-management/domains',
	siteId,
];

export const useEmailsManagementDomainsQuery = ( siteId: number, queryOptions = {} ) => {
	return useQuery(
		getEmailsManagementDomainsQueryCacheKey( siteId ),
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/emails/domains`,
				apiNamespace: 'wpcom/v2',
			} ),
		queryOptions
	);
};
