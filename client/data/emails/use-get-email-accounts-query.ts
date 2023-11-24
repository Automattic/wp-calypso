import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { EmailAccount } from './types';
import type { UseQueryOptions } from '@tanstack/react-query';

type UseGetEmailAccountsQueryData = EmailAccount[];

export const getCacheKey = ( siteId: number | null, domain: string ) => [
	'sites',
	siteId,
	'emails',
	'accounts',
	domain,
	'mailboxes',
];

/**
 * Get the associated emails given a Site Identificator and a domain string (example.com)
 * @param siteId Site identificator
 * @param domain Domain name
 * @param queryOptions Query options
 * @returns Returns the result of the `useQuery` call
 */
export const useGetEmailAccountsQuery = (
	siteId: number | null,
	domain: string,
	queryOptions?: UseQueryOptions< any, unknown, UseGetEmailAccountsQueryData >
) => {
	return useQuery< any, unknown, UseGetEmailAccountsQueryData >( {
		queryKey: getCacheKey( siteId, domain ),
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/emails/accounts/${ encodeURIComponent( domain ) }/mailboxes`,
				apiNamespace: 'wpcom/v2',
			} ),
		select: ( data ) => data.accounts,
		...queryOptions,
	} );
};
