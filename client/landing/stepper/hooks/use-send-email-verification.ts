import wpcom from 'calypso/lib/wp';

export function useSendEmailVerification() {
	return async () => {
		return wpcom.req.post( '/me/send-verification-email', { apiVersion: '1.1' } );
	};
}
