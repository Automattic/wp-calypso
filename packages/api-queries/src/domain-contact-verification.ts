import { domainContactVerification } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

export const domainContactVerificationMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( params: {
			formData: [ string, File, string ][];
			metadata?: { nationalityType?: 'indian_national' | 'foreign_national' };
		} ) => domainContactVerification( domainName, params.formData, params.metadata ),
	} );
