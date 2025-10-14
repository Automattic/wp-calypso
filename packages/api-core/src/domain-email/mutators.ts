import { wpcom } from '../wpcom-fetcher';

export async function addEmailForwarder(
	domain: string,
	mailbox: string,
	destinations: string[]
): Promise< void > {
	return wpcom.req.post( `/domains/${ encodeURIComponent( domain ) }/email/new`, {
		mailbox,
		destinations,
	} );
}
