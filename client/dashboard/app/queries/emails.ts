import { queryOptions } from '@tanstack/react-query';
import { fetchEmails } from '../../data/emails';

export const emailsQuery = () =>
	queryOptions( {
		queryKey: [ 'emails' ],
		queryFn: fetchEmails,
	} );
