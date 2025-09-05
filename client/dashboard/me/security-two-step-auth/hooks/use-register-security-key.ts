import {
	securityKeyRegistrationChallengeQuery,
	validateSecurityKeyRegistrationMutation,
} from '@automattic/api-queries';
import { create, supported } from '@github/webauthn-json';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

function isBrowser() {
	try {
		if ( ! window ) {
			return false;
		}
	} catch ( err ) {
		return false;
	}
	return true;
}

export const isWebAuthnSupported = () => {
	return isBrowser() && supported();
};

export const useRegisterSecurityKey = () => {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async ( keyName: string ) => {
			try {
				// First, get the registration challenge
				const options = await queryClient.fetchQuery( securityKeyRegistrationChallengeQuery() );

				// Create the WebAuthn credential
				const credential = await create( { publicKey: options } );

				// Validate the registration with the server
				const validationData = {
					data: JSON.stringify( credential ),
					name: keyName,
				};
				return await validateSecurityKeyRegistrationMutation().mutationFn?.( validationData );
			} catch ( error ) {
				// Handle WebAuthn specific errors with user-friendly messages
				if ( error && typeof error === 'object' && 'name' in error ) {
					switch ( error.name ) {
						case 'InvalidStateError':
							throw new Error( __( 'Security key has already been registered.' ) );
						case 'NotAllowedError':
							throw new Error( __( 'Security key interaction timed out or canceled.' ) );
						case 'AbortError':
							throw new Error( __( 'Security key interaction canceled.' ) );
						case 'NotSupportedError':
						case 'SecurityError':
						default:
							throw new Error( __( 'Security key registration error.' ) );
					}
				}

				// Re-throw other errors as-is
				throw error;
			}
		},
	} );
};
