import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface SetupSSHMigrationParams {
	siteId: number;
	migrationSourceSiteDomain: string;
}

interface SetupSSHMigrationResponse {
	success: boolean;
	migration_source_site_domain: string;
	message: string;
}

/**
 * Sets up site migration by registering the source domain
 * @param params - Migration parameters including site ID and source domain
 * @returns Promise with migration setup response
 */
const setupSSHMigration = async (
	params: SetupSSHMigrationParams
): Promise< SetupSSHMigrationResponse > => {
	try {
		const response = await wpcom.req.post( {
			path: `/sites/${ params.siteId }/ssh-migration`,
			apiNamespace: 'wpcom/v2',
			body: {
				migration_source_site_domain: params.migrationSourceSiteDomain,
			},
		} );

		if ( ! response.success ) {
			throw new Error( response.message || 'Failed to setup site migration' );
		}

		return response;
	} catch ( error ) {
		throw new Error( error instanceof Error ? error.message : 'Failed to setup site migration' );
	}
};

/**
 * Hook to setup site migration
 * @returns Mutation object with setup function and status
 */
export const useSetupSSHMigration = () => {
	return useMutation< SetupSSHMigrationResponse, Error, SetupSSHMigrationParams >( {
		mutationFn: setupSSHMigration,
	} );
};
