import { vgsVaultIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

export const useVaultId = () => {
	return useQuery( {
		...vgsVaultIdQuery(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 3,
	} );
};
