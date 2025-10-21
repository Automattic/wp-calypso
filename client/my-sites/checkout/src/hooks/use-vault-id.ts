import { useQuery } from '@tanstack/react-query';
import { VGSCollectVaultEnvironment } from '@vgs/collect-js-react';
import wpcom from 'calypso/lib/wp';

interface VaultIdResponse {
	vault_id: string;
	environment: VGSCollectVaultEnvironment;
}

export const useVaultId = ( testMode: boolean = true ) => {
	return useQuery< VaultIdResponse >( {
		queryKey: [ 'vault-id', testMode ],
		queryFn: async () => {
			return await wpcom.req.get( {
				path: '/transact/vgs/wpcom/vault-id',
				apiNamespace: 'wpcom/v2',
			} );
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 3,
	} );
};
