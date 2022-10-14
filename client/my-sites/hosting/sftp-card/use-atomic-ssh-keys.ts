import { useQuery, UseQueryOptions } from 'react-query';
import wp from 'calypso/lib/wp';

export const USE_ATOMIC_SSH_KEYS_QUERY_KEY = 'atomic-ssh-keys';

interface AtomicKey {
	id: number;
	fingerprint: string;
	name: string;
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
		}
	);
};
