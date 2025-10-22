import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface StartSSHMigrationParams {
	siteId: number;
	remoteHost: string;
	remoteUser: string;
	remoteDomain: string;
	remotePass?: string;
	remoteDocroot?: string;
	sshId?: string;
	sshIdPass?: string;
}

interface StartSSHMigrationResponse {
	success: boolean;
	message?: string;
	error?: string;
}

/**
 * Starts SSH migration for the specified site
 * @param params - Migration parameters including host, credentials, etc.
 * @returns Promise with migration start response
 */
const startSSHMigration = async (
	params: StartSSHMigrationParams
): Promise< StartSSHMigrationResponse > => {
	try {
		const body: Record< string, string > = {
			remote_host: params.remoteHost,
			remote_user: params.remoteUser,
			remote_domain: params.remoteDomain,
		};

		if ( params.remotePass ) {
			body.remote_pass = params.remotePass;
		}

		if ( params.remoteDocroot ) {
			body.remote_docroot = params.remoteDocroot;
		}

		if ( params.sshId ) {
			body.ssh_id = params.sshId;
		}

		if ( params.sshIdPass ) {
			body.ssh_id_pass = params.sshIdPass;
		}

		const response = await wpcom.req.post( {
			path: `/sites/${ params.siteId }/ssh-migration/start`,
			apiNamespace: 'wpcom/v2',
			body,
		} );

		if ( ! response.success ) {
			throw new Error( response.message || 'Failed to start SSH migration' );
		}

		return response;
	} catch ( error ) {
		throw new Error( error instanceof Error ? error.message : 'Failed to start SSH migration' );
	}
};

/**
 * Hook to start SSH migration
 * @returns Mutation object with start function and status
 */
export const useStartSSHMigration = () => {
	return useMutation< StartSSHMigrationResponse, Error, StartSSHMigrationParams >( {
		mutationFn: startSSHMigration,
	} );
};
