import { wpcom } from './wpcom-fetcher';

/**
 * VGS's own name for the vault's region. Mirrors `VGSCollectVaultEnvironment`
 * from `@vgs/collect-js-react`, which this package does not depend on.
 */
export type VgsVaultEnvironment = 'sandbox' | 'live' | 'live-eu-1' | 'live-ap-1';

/**
 * Identifies the VGS Collect vault that card fields are tokenized against.
 */
export interface VgsVaultId {
	vault_id: string;
	environment: VgsVaultEnvironment;
}

export async function fetchVgsVaultId(): Promise< VgsVaultId > {
	return await wpcom.req.get( {
		path: '/transact/vgs/wpcom/vault-id',
		apiNamespace: 'wpcom/v2',
	} );
}
