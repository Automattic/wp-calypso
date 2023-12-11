import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { UseQueryOptions } from '@tanstack/react-query';

export const getCacheKey = ( domain: string, mailboxName: string ) => [
	'emails',
	'titan',
	domain,
	'check-mailbox-availability',
	mailboxName,
];

// A list of error statuses that are seen as final and shouldn't be retried for this query
const finalErrorStatuses = [ 400, 401, 403, 409 ];

/**
 * Checks whether a mailbox name/domain i.e. email address is available for creation.
 * @param domainName The domain name of the mailbox
 * @param mailboxName The mailbox name
 * @param queryOptions Optional options to pass to the underlying query engine
 * @returns Returns the result of the `useQuery` call
 */
export const useGetTitanMailboxAvailability = (
	domainName: string,
	mailboxName: string,
	queryOptions: Omit< UseQueryOptions< any, any >, 'queryKey' > = {}
) => {
	return useQuery< any, any >( {
		queryKey: getCacheKey( domainName, mailboxName ),
		queryFn: () =>
			wpcom.req.get( {
				path: `/emails/titan/${ encodeURIComponent(
					domainName
				) }/check-mailbox-availability/${ encodeURIComponent( mailboxName ) }`,
				apiNamespace: 'wpcom/v2',
			} ),
		...queryOptions,
		retry: ( count, { message: status } ) => finalErrorStatuses.includes( status ),
	} );
};
