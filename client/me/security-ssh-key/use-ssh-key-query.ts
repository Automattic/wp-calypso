import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

/**
 * List of allowed SSH key formats.
 *
 * We need to keep it in sync with \Openssh_Authorized_Key::VALID_TYPES_AND_BITS from WPCOM.
 */
export const SSH_KEY_FORMATS = [
	'ssh-rsa',
	'ssh-ed25519',
	'ecdsa-sha2-nistp256',
	'ecdsa-sha2-nistp384',
	'ecdsa-sha2-nistp521',
] as const;

export interface SSHKeyData {
	name: string;
	key: string;
	type: ( typeof SSH_KEY_FORMATS )[ number ];
	sha256: string;
	created_at: string;
}

export const SSH_KEY_QUERY_KEY = [ 'me', 'ssh-keys' ];

export const useSSHKeyQuery = () =>
	useQuery( {
		queryKey: SSH_KEY_QUERY_KEY,
		queryFn: (): SSHKeyData[] =>
			wp.req.get( '/me/ssh-keys', {
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
	} );
