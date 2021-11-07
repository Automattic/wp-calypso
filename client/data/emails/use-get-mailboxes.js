import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export const getMailboxesCacheKey = ( siteId ) => [ 'emails/mailboxes', siteId ];

/**
 * Get the associated mailboxes for a given site
 *
 * @param {number} siteId Site identifier
 * @param {object} queryOptions Query options
 * @returns {data, error, isLoading} Returns an object with the requested mailboxes
 */
export const useGetMailboxes = ( siteId, queryOptions = {} ) => {
	return useQuery(
		getMailboxesCacheKey( siteId ),
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/emails/mailboxes`,
				apiNamespace: 'wpcom/v2',
			} ),
		queryOptions
	);
};
