import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { UseQueryOptions } from 'react-query';

type UseGetMailboxesQueryData = any[];

export const getCacheKey = ( siteId: number | null ) => [ 'sites', siteId, 'emails', 'mailboxes' ];

/**
 * Get the associated mailboxes for a given site
 *
 * @param siteId Site identifier
 * @param queryOptions Query options
 * @returns Returns the result of the `useQuery` call
 */
export const useGetMailboxes = (
	siteId: number,
	queryOptions?: UseQueryOptions< any, unknown, UseGetMailboxesQueryData >
) => {
	return useQuery< any, unknown, UseGetMailboxesQueryData >(
		getCacheKey( siteId ),
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/emails/mailboxes`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			select: ( data ) => data.mailboxes,
			...queryOptions,
		}
	);
};
