import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const USE_ATOMIC_SSH_KEYS_QUERY_KEY = 'atomic-ssh-keys';

export interface AtomicKey {
	sha256: string;
	user_login: string;
	name: string;
	attached_at: string;
}

export const useAtomicSshKeys = (
	siteId: number,
	options: Omit< UseQueryOptions< { ssh_keys: AtomicKey[] } >, 'queryKey' >
) => {
	return useQuery( {
		queryKey: [ USE_ATOMIC_SSH_KEYS_QUERY_KEY, siteId ],
		queryFn: (): Promise< { ssh_keys: AtomicKey[] } > =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/ssh-keys`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId && ( options.enabled ?? true ),
		select: ( data ) => {
			return data.ssh_keys;
		},
		meta: {
			persist: false,
		},
	} );
};
