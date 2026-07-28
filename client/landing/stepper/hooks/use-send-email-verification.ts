import { useCallback } from 'react';
import wpcom from 'calypso/lib/wp';

export interface ResendEmailVerificationBody {
	from?: string; // Helps decide the url of the page after confirmation.
}

export interface SendEmailVerificationResponse {
	success: boolean;
}

export function useSendEmailVerification( { from }: ResendEmailVerificationBody = {} ) {
	// Stable across renders (keyed on `from`, a primitive) so callers can depend on it
	// directly instead of routing through a ref.
	return useCallback( async (): Promise< SendEmailVerificationResponse > => {
		return wpcom.req.post( '/me/send-verification-email', {
			apiVersion: '1.1',
			...( from ? { from } : {} ),
		} );
	}, [ from ] );
}
