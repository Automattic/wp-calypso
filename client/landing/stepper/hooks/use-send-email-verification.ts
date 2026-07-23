import wpcom from 'calypso/lib/wp';

export interface ResendEmailVerificationBody {
	from?: string; // Helps decide the url of the page after confirmation.
}

export interface SendEmailVerificationResponse {
	success: boolean;
}

export function useSendEmailVerification( body: ResendEmailVerificationBody = {} ) {
	return async (): Promise< SendEmailVerificationResponse > => {
		return wpcom.req.post( '/me/send-verification-email', {
			apiVersion: '1.1',
			...body,
		} );
	};
}
