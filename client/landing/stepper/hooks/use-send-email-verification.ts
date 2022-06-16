import wpcom from 'calypso/lib/wp';

export function useSendEmailVerification() {
	const sendEmailVerification = async () => {
		return wpcom.req.post( '/me/send-verification-email', { apiVersion: '1.1' } );
	};

	return sendEmailVerification;
}
