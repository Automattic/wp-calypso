import { fetchEmails } from '../../data/emails';

export const emailsQuery = () => ( {
	queryKey: [ 'emails' ],
	queryFn: fetchEmails,
} );
