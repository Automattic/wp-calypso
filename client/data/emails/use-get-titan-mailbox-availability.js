/**
 * External dependencies
 */
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

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
