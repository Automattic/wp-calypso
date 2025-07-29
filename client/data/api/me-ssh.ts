import wpcom from 'calypso/lib/wp';

export interface UserSshKey {
	name: string;
	key: string;
	type:
		| 'ssh-rsa'
		| 'ssh-ed25519'
		| 'ecdsa-sha2-nistp256'
		| 'ecdsa-sha2-nistp384'
		| 'ecdsa-sha2-nistp521';
	sha256: string;
	created_at: string;
}

export async function fetchSshKeys(): Promise< UserSshKey[] > {
	return wpcom.req.get( {
		path: '/me/ssh-keys',
		apiNamespace: 'wpcom/v2',
	} );
}
