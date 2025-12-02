import { useMutation } from '@tanstack/react-query';
import { urlToDomain } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';

interface GenerateSSHKeyParams {
	siteId: number;
	remoteUser: string;
	remoteHost: string;
	remotePort: number;
	remoteDomain: string;
}

interface GenerateSSHKeyResponse {
	ssh_public_key: string;
}

/**
 * Generates SSH key for migration
 * @param params - SSH details including username, host, domain, and port
 * @returns Promise with SSH key response
 */
const generateSSHKey = async (
	params: GenerateSSHKeyParams
): Promise< GenerateSSHKeyResponse > => {
	try {
		const remoteDomain = urlToDomain( params.remoteDomain );

		if ( ! remoteDomain ) {
			throw new Error( 'Invalid remote domain' );
		}

		const body = {
			remote_user: params.remoteUser,
			remote_host: params.remoteHost,
			remote_port: String( params.remotePort ),
			remote_domain: remoteDomain,
		};

		const response = await wpcom.req.post( {
			path: `/sites/${ params.siteId }/ssh-migration/configure`,
			apiNamespace: 'wpcom/v2',
			body,
		} );

		if ( ! response.ssh_public_key ) {
			throw new Error( 'Failed to generate SSH key' );
		}

		return response;
	} catch ( error ) {
		throw new Error( error instanceof Error ? error.message : 'Failed to generate SSH key' );
	}
};

/**
 * Hook to generate SSH key for migration
 * @returns Mutation object with generate function and status
 */
export const useGenerateSSHKey = () => {
	return useMutation< GenerateSSHKeyResponse, Error, GenerateSSHKeyParams >( {
		mutationFn: generateSSHKey,
	} );
};
