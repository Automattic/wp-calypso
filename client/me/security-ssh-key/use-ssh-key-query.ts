import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';

export interface SSHKeyData {
	name: string;
	key: string;
}

export const SSH_KEY_QUERY_KEY = [ 'me', 'ssh-keys' ];

export const useSSHKeyQuery = () =>
	useQuery( SSH_KEY_QUERY_KEY, (): SSHKeyData[] =>
		wp.req.get( '/me/ssh-keys', {
			apiNamespace: 'wpcom/v2',
		} )
	);
