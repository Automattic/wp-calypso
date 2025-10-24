import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface SSHMigrationStatusParams {
	siteId: number;
	enabled?: boolean;
}

/**
 * Response from the SSH migration status endpoint
 * @property success - Indicates if the status request was successful
 * @property status - High-level migration status (in-progress, migrating, completed, or failed)
 * @property step - Detailed migration step indicating current progress through the migration process
 */
interface SSHMigrationStatusResponse {
	success: boolean;
	status: 'in-progress' | 'migrating' | 'completed' | 'failed';
	step:
		| 'starting-migration'
		| 'quickforget-read'
		| 'quickforget-decode'
		| 'migration-create'
		| 'migration-created'
		| 'migration-update'
		| 'preflight'
		| 'preflight-success'
		| 'preflight-running'
		| 'migration-success'
		| 'migration-starting'
		| 'migration-running'
		| 'completed';
}

/**
 * Fetches the SSH migration status for a site
 * @param siteId - The site ID to check migration status for
 * @returns Promise with migration status response
 */
const fetchSSHMigrationStatus = async ( siteId: number ): Promise< SSHMigrationStatusResponse > => {
	try {
		const response = await wpcom.req.get( {
			path: `/sites/${ siteId }/ssh-migration/status`,
			apiNamespace: 'wpcom/v2',
		} );

		return response;
	} catch ( error ) {
		throw new Error(
			error instanceof Error ? error.message : 'Failed to fetch SSH migration status'
		);
	}
};

/**
 * Hook to fetch and poll SSH migration status
 * @param params - Site ID and optional enabled flag
 * @param pollingInterval - Optional polling interval in milliseconds (default: 5000ms)
 * @returns Query object with migration status data and status
 */
export const useSSHMigrationStatus = (
	params: SSHMigrationStatusParams,
	pollingInterval = 5000
) => {
	const { siteId, enabled = true } = params;

	return useQuery< SSHMigrationStatusResponse, Error >( {
		queryKey: [ 'ssh-migration-status', siteId ],
		queryFn: () => fetchSSHMigrationStatus( siteId ),
		enabled: enabled && siteId > 0,
		refetchInterval: ( query ) => {
			// Stop polling if migration is completed or failed
			const status = query.state.data?.status;
			if ( status === 'completed' || status === 'failed' ) {
				return false;
			}
			return pollingInterval;
		},
		refetchIntervalInBackground: true,
		// Retry failed requests
		retry: 3,
		retryDelay: ( attemptIndex ) => Math.min( 1000 * 2 ** attemptIndex, 30000 ),
	} );
};
