import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface VerifySSHMigrationAtomicTransferResponse {
	blog_id: number;
	transfer_id: number;
	transfer_status: string;
	allow_site_migration: boolean;
}

const verifySSHMigrationAtomicTransfer = (
	siteId: number
): Promise< VerifySSHMigrationAtomicTransferResponse > =>
	wpcom.req.post( {
		path: `/sites/${ siteId }/atomic/transfer-ssh-migration`,
		apiNamespace: 'wpcom/v2',
	} );

export function useVerifySSHMigrationAtomicTransferQueryKey( siteId: number ) {
	return [ 'sites', siteId, 'atomic', 'transfer-ssh-migration' ];
}

interface UseVerifySSHMigrationAtomicTransferOptions {
	enabled?: boolean;
}

export const useVerifySSHMigrationAtomicTransfer = (
	siteId: number,
	{ enabled = true }: UseVerifySSHMigrationAtomicTransferOptions = {}
) => {
	return useQuery( {
		queryKey: useVerifySSHMigrationAtomicTransferQueryKey( siteId ),
		queryFn: () => verifySSHMigrationAtomicTransfer( siteId ),
		enabled: enabled && !! siteId,
		retry: false,
		staleTime: Infinity, // Only fetch once
	} );
};
