import { useState } from 'react';
import useRequestContactVerificationCode from 'calypso/state/jetpack-agency-dashboard/hooks/use-request-contact-verification-code';
import type { RequestVerificationCodeParams } from '../../sites-overview/types';

export default function useRequestVerificationCode(): {
	mutate: ( params: RequestVerificationCodeParams ) => void;
	isError: boolean;
	isPending: boolean;
	isSuccess: boolean;
	isVerified: boolean;
	data: any;
} {
	const [ isAlreadyVerifed, setIsAlreadyVerifed ] = useState( false );

	const data = useRequestContactVerificationCode( {
		retry: false,
		onError: async ( error ) => {
			// Add the contact to the list of contacts if already verified
			if (
				error?.code &&
				[ 'existing_verified_email_contact', 'existing_verified_sms_contact' ].includes(
					error.code
				)
			) {
				setIsAlreadyVerifed( true );
			}
		},
	} );
	return { ...data, isVerified: isAlreadyVerifed };
}
