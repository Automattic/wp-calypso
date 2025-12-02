import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface VerifySSHConnectionParams {
	serverAddress: string;
	port: number;
	siteId: number;
}

interface VerifySSHConnectionResponse {
	success: boolean;
	message?: string;
	error?: string;
}

/**
 * Verifies SSH connection to the specified server
 * @param params - Server address, port, and site ID
 * @returns Promise with verification response
 */
const verifySSHConnection = async (
	params: VerifySSHConnectionParams
): Promise< VerifySSHConnectionResponse > => {
	try {
		const response = await wpcom.req.post( {
			path: `/sites/${ params.siteId }/ssh-migration/verify-host`,
			apiNamespace: 'wpcom/v2',
			body: {
				host: params.serverAddress,
				port: String( params.port ),
			},
		} );

		if ( ! response.success ) {
			throw new Error( response.message || 'Failed to verify SSH connection' );
		}

		return response;
	} catch ( error ) {
		throw new Error( error instanceof Error ? error.message : 'Failed to verify SSH connection' );
	}
};

/**
 * Hook to verify SSH connection
 * @returns Mutation object with verify function and status
 */
export const useVerifySSHConnection = () => {
	return useMutation< VerifySSHConnectionResponse, Error, VerifySSHConnectionParams >( {
		mutationFn: verifySSHConnection,
	} );
};
