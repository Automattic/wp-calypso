import { useQuery, UseQueryOptions } from 'react-query';
import wp from 'calypso/lib/wp';

export const USE_ATOMIC_SSH_KEYS_QUERY_KEY = 'atomic-ssh-keys';

export interface AtomicKey {
	sha256: string;
	user_login: string;
	name: string;
	attached_at: string;
}

export const useAtomicSshKeys = ( siteId: number, options: UseQueryOptions ) => {
	return useQuery< { ssh_keys: Array< AtomicKey > }, unknown, Array< AtomicKey > >(
		[ USE_ATOMIC_SSH_KEYS_QUERY_KEY, siteId ],
		() =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/ssh-keys`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId && ( options.enabled ?? true ),
			select: ( data ) => {
				return data.ssh_keys;
			},
			meta: {
				persist: false,
			},
		}
	);
};
