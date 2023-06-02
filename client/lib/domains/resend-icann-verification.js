import wpcom from 'calypso/lib/wp';

export function resendIcannVerification( domainName, onComplete ) {
	return wpcom.req.post( `/domains/${ domainName }/resend-icann`, onComplete );
}
