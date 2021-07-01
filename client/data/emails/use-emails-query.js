/**
 * External dependencies
 */
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export const getCacheKey = ( siteId, domain ) => [ 'emailAccounts', siteId, domain ];

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
export const useEmailAccountsQuery = ( siteId, domain, queryOptions = {} ) => {
	return useQuery(
		getCacheKey( siteId, domain ),
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/emails/accounts/${ encodeURIComponent( domain ) }/mailboxes`,
				apiNamespace: 'wpcom/v2',
			} ),
		queryOptions
	);
};
