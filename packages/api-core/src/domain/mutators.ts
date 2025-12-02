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

export function resendVerifyEmailForward(
	domainName: string,
	mailbox: string,
	destination: string
): Promise< void > {
	return wpcom.req.post(
		`/domains/${ encodeURIComponent( domainName ) }/email/${ encodeURIComponent(
			mailbox
		) }/${ encodeURIComponent( destination ) }/resend-verification`
	);
}

export function deleteEmailForward(
	domainName: string,
	mailbox: string,
	destination: string
): Promise< void > {
	return wpcom.req.post(
		`/domains/${ encodeURIComponent( domainName ) }/email/${ encodeURIComponent(
			mailbox
		) }/${ encodeURIComponent( destination ) }/delete`
	);
}
