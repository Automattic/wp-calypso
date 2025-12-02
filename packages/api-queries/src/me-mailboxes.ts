import { fetchUserMailboxes } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export function userMailboxesQuery() {
	return queryOptions( {
		queryKey: [ 'me', 'mailboxes' ],
		queryFn: () => fetchUserMailboxes(),
	} );
}
