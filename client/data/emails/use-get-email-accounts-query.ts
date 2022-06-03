import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

type UseQueryParams = Parameters< typeof useQuery >;

export const getCacheKey = ( siteId: number | null, domain: string ) => [
	'emailAccounts',
	siteId,
	domain,
];

/**
 * Get the associated emails given a Site Identificator
 * and a domain string (example.com)
 *
 * @param {number} siteId Site identificator
 * @param {string} domain Domain
 * @param {object} queryOptions Query options
 * @returns {data, error, isLoading} Returns and object with the
 * data associated to the SiteId & Domain
 */
export const useGetEmailAccountsQuery = (
	siteId: number,
	domain: string,
	queryOptions?: UseQueryParams[ 2 ]
) => {
	return useQuery< any >(
		getCacheKey( siteId, domain ),
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/emails/accounts/${ encodeURIComponent( domain ) }/mailboxes`,
				apiNamespace: 'wpcom/v2',
			} ),
		queryOptions
	);
};
