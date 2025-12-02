import { wpcom } from '../wpcom-fetcher';

export function createTitanMailbox( {
	domainName,
	name,
	mailbox,
	password,
	passwordResetEmail,
	isAdmin,
}: {
	domainName: string;
	name: string;
	mailbox: string;
	password: string;
	passwordResetEmail: string;
	isAdmin: boolean;
} ): Promise< void > {
	return wpcom.req.post( {
		path: `/emails/titan/${ encodeURIComponent( domainName ) }/mailbox/create`,
		apiNamespace: 'wpcom/v2',
		body: {
			name,
			mailbox,
			password,
			alternate_email_address: passwordResetEmail,
			is_admin: isAdmin,
		},
	} );
}

export function deleteTitanMailbox( domainName: string, mailboxName: string ): Promise< void > {
	return wpcom.req.get( {
		path: `/emails/titan/${ encodeURIComponent( domainName ) }/mailbox/${ encodeURIComponent(
			mailboxName
		) }`,
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
	} );
}
