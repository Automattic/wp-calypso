import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';

export const SSH_KEY_FORMATS = [
	'ssh-rsa',
	'ssh-ed25519',
	'ecdsa-sha2-nistp256',
	'ecdsa-sha2-nistp521',
] as const;

export interface SSHKeyData {
	name: string;
	key: string;
	type: typeof SSH_KEY_FORMATS[ number ];
	sha256: string;
	created_at: string;
}

export const SSH_KEY_QUERY_KEY = [ 'me', 'ssh-keys' ];

export const useSSHKeyQuery = () =>
	useQuery( SSH_KEY_QUERY_KEY, (): SSHKeyData[] =>
		wp.req.get( '/me/ssh-keys', {
			apiNamespace: 'wpcom/v2',
		} )
	);
