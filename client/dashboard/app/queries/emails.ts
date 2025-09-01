import { fetchEmails, fetchMailboxes } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const emailsQuery = () =>
	queryOptions( {
		queryKey: [ 'emails' ],
		queryFn: fetchEmails,
	} );

export const mailboxesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'mailboxes', siteId ],
		queryFn: () => fetchMailboxes( siteId ),
	} );
