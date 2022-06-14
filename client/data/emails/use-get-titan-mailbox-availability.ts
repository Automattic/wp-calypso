import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { UseQueryOptions } from 'react-query';

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
 *
 * @param domainName The domain name of the mailbox
 * @param mailboxName The mailbox name
 * @param queryOptions Optional options to pass to the underlying query engine
 * @returns Returns various parameters piped from `useQuery`
 */
export const useGetTitanMailboxAvailability = (
	domainName: string,
	mailboxName: string,
	queryOptions: UseQueryOptions< any, any > = {}
) => {
	return useQuery< any, any >(
		getCacheKey( domainName, mailboxName ),
		() =>
			wpcom.req.get( {
				path: `/emails/titan/${ encodeURIComponent(
					domainName
				) }/check-mailbox-availability/${ encodeURIComponent( mailboxName ) }`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			...queryOptions,
			retry: ( count, { message: status } ) => finalErrorStatuses.includes( status ),
		}
	);
};
