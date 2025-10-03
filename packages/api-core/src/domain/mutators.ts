import { wpcom } from '../wpcom-fetcher';

export function disconnectDomain( domainName: string ): Promise< void > {
	return wpcom.req.get( {
		path: `/domains/${ domainName }/disconnect-domain-from-site`,
	} );
}

export function resendIcannVerificationEmail( domainName: string ): Promise< void > {
	return wpcom.req.post( {
		path: `/domains/${ domainName }/resend-icann`,
	} );
}
