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

// Transfer statuses that indicate the transfer is complete or in a final state
const FINAL_TRANSFER_STATUSES = [ 'completed', 'error', 'reverted' ];

export const useVerifySSHMigrationAtomicTransfer = (
	siteId: number,
	{ enabled = true }: UseVerifySSHMigrationAtomicTransferOptions = {}
) => {
	const query = useQuery( {
		queryKey: useVerifySSHMigrationAtomicTransferQueryKey( siteId ),
		queryFn: () => verifySSHMigrationAtomicTransfer( siteId ),
		enabled: enabled && !! siteId,
		retry: false,
		refetchInterval: ( query ) => {
			const transferStatus = query.state.data?.transfer_status;

			// Stop polling if we've reached a final state
			if ( transferStatus && FINAL_TRANSFER_STATUSES.includes( transferStatus ) ) {
				return false;
			}

			// Continue polling if status is in progress or unknown
			return 2000; // Poll every 2 seconds
		},
	} );

	return query;
};
