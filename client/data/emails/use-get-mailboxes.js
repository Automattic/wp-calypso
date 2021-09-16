import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export const useGetMailboxes = ( siteId, queryOptions = {} ) => {
	return useQuery(
		[ 'emails/mailboxes', siteId ],
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/emails/mailboxes`,
				apiNamespace: 'wpcom/v2',
			} ),
		queryOptions
	);
};
