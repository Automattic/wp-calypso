import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { Mailbox } from './types';
import type { UseQueryOptions } from '@tanstack/react-query';

type UseGetMailboxesQueryData = Mailbox[];

export const getCacheKey = ( siteId: number | null ) => [ 'sites', siteId, 'emails', 'mailboxes' ];

/**
 * Get the associated mailboxes for a given site
 * @param siteId Site identifier
 * @param queryOptions Query options
 * @returns Returns the result of the `useQuery` call
 */
export const useGetMailboxes = (
	siteId: number,
	queryOptions?: UseQueryOptions< any, unknown, UseGetMailboxesQueryData >
) => {
	return useQuery< any, unknown, UseGetMailboxesQueryData >( {
		queryKey: getCacheKey( siteId ),
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/emails/mailboxes`,
				apiNamespace: 'wpcom/v2',
			} ),
		select: ( data ) => data.mailboxes,
		...queryOptions,
	} );
};
