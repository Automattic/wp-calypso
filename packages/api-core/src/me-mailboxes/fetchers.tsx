import { EmailAccount } from '../emails';
import { wpcom } from '../wpcom-fetcher';

export async function fetchUserMailboxes(): Promise< EmailAccount[] > {
	// Without this the response omits domains the user manages but doesn't own the
	// subscription for, hiding their email from site administrators.
	return await wpcom.req.get(
		{ path: '/me/mailboxes', apiVersion: '1' },
		{ include_all_managed_domains: true }
	);
}
