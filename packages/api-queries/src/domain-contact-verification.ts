import { domainContactVerification } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

export const domainContactVerificationMutation = ( domainName: string ) =>
	mutationOptions( {
		meta: { statId: 'domain-contact-verify' },
		mutationFn: ( formData: [ string, File, string ][] ) =>
			domainContactVerification( domainName, formData ),
	} );
