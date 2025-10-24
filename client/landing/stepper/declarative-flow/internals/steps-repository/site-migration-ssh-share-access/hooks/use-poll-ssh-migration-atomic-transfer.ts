import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface SSHMigrationAtomicTransferStatusResponse {
	blog_id: number;
	transfer_id: number;
	transfer_status: string;
}

const pollSSHMigrationAtomicTransfer = (
	siteId: number,
	transferId: number
): Promise< SSHMigrationAtomicTransferStatusResponse > =>
	wpcom.req.get( {
		path: `/sites/${ siteId }/atomic/transfer-ssh-migration/${ transferId }`,
		apiNamespace: 'wpcom/v2',
	} );

export function usePollSSHMigrationAtomicTransferQueryKey( siteId: number, transferId: number ) {
	return [ 'sites', siteId, 'atomic', 'transfer-ssh-migration', transferId ];
}

// Transfer statuses that indicate completion (no need to continue polling)
const endStates = [ 'completed', 'failed', 'error', 'reverted' ];

interface UsePollSSHMigrationAtomicTransferOptions {
	enabled?: boolean;
	refetchInterval?: number;
}

export const usePollSSHMigrationAtomicTransfer = (
	siteId: number,
	transferId: number | null,
	{
		enabled = true,
		refetchInterval = 3000, // Default 3 seconds
	}: UsePollSSHMigrationAtomicTransferOptions = {}
) => {
	const query = useQuery( {
		queryKey: usePollSSHMigrationAtomicTransferQueryKey( siteId, transferId ?? 0 ),
		queryFn: () => pollSSHMigrationAtomicTransfer( siteId, transferId ?? 0 ),
		enabled: enabled && !! siteId && !! transferId,
		refetchInterval: ( query ) => {
			// Stop polling if we reach an end state
			if ( query.state.data && endStates.includes( query.state.data.transfer_status ) ) {
				return false;
			}
			return refetchInterval;
		},
		retry: false,
	} );

	const isTransferring =
		query.data && ! endStates.includes( query.data.transfer_status ) ? true : false;

	return {
		...query,
		isTransferring,
		transferStatus: query.data?.transfer_status,
	};
};
