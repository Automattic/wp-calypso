import { domainContactVerification } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

export const domainContactVerificationMutation = (
	domainName: string,
	verificationType?: string
) =>
	mutationOptions( {
		mutationFn: ( formData: [ string, File, string ][] ) =>
			domainContactVerification( domainName, formData, verificationType ),
	} );
