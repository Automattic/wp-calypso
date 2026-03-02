import { wpcom } from '../wpcom-fetcher';
import type { UpdateEmailForwardResponse } from './types';

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

export function updateEmailForward(
	domainName: string,
	mailbox: string,
	destination: string,
	newDestination: string
): Promise< UpdateEmailForwardResponse > {
	return wpcom.req.post(
		`/domains/${ encodeURIComponent( domainName ) }/email/${ encodeURIComponent( mailbox ) }`,
		{
			destination,
			new_destination: newDestination,
		}
	);
}
