import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { UseQueryOptions } from 'react-query';

export type Mailbox = {
	domain: string;
	mailbox: string;
};

export type EmailAccount = {
	account_type: string;
	emails: Mailbox[];
};

export type UseGetEmailAccountsQueryData = EmailAccount[];

export const getCacheKey = ( siteId: number | null, domain: string ) => [
	'sites',
	siteId,
	'emails',
	'accounts',
	domain,
	'mailboxes',
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
	queryOptions?: UseQueryOptions< any, unknown, UseGetEmailAccountsQueryData >
) => {
	return useQuery< any, unknown, UseGetEmailAccountsQueryData >(
		getCacheKey( siteId, domain ),
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/emails/accounts/${ encodeURIComponent( domain ) }/mailboxes`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			select: ( data ) => data.accounts,
			...queryOptions,
		}
	);
};
