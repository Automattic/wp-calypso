import { fetchEmails } from '../api/emails';

export const emailsQuery = () => ( {
	queryKey: [ 'emails' ],
	queryFn: fetchEmails,
} );
