import { queryOptions } from '@tanstack/react-query';
import { fetchEmails, fetchMailboxes } from '../../data/emails';

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
