import { wpcom } from '../wpcom-fetcher';

export function deleteTitanMailbox( domainName: string, mailboxName: string ): Promise< void > {
	return wpcom.req.get( {
		path: `/emails/titan/${ encodeURIComponent( domainName ) }/mailbox/${ encodeURIComponent(
			mailboxName
		) }`,
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
	} );
}
