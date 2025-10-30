import { EmailAccount } from '../emails';
import { wpcom } from '../wpcom-fetcher';

export async function fetchUserMailboxes(): Promise< EmailAccount[] > {
	return await wpcom.req.get( { path: '/me/mailboxes', apiVersion: '1' } );
}
