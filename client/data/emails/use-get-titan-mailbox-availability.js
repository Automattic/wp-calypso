/**
 * External dependencies
 */
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

/**
 * Checks whether a mailbox name/domain i.e. email address is available for creation.
 *
 * @param {string} domainName The domain name of the mailbox
 * @param {string} mailboxName The mailbox name
 * @param {object} queryOptions Optional options to pass to the underlying query engine
 * @returns {{ data, error, isLoading: boolean ...}} Returns various parameters piped from `useQuery`
 */
export const useGetTitanMailboxAvailability = ( domainName, mailboxName, queryOptions = {} ) => {
	return useQuery(
		[ domainName, mailboxName ],
		() =>
			wpcom.req.get( {
				path: `/emails/titan/${ encodeURIComponent(
					domainName
				) }/check-mailbox-availability/${ encodeURIComponent( mailboxName ) }`,
				apiNamespace: 'wpcom/v2',
			} ),
		queryOptions
	);
};
