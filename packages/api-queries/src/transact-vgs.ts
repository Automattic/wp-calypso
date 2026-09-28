import { fetchVgsVaultId } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const vgsVaultIdQuery = () =>
	queryOptions( {
		queryKey: [ 'transact', 'vgs', 'vault-id' ],
		queryFn: fetchVgsVaultId,
	} );
