import { translate } from 'i18n-calypso';
import useRequestContactVerificationCode from 'calypso/state/jetpack-agency-dashboard/hooks/use-request-contact-verification-code';
import useResendVerificationCodeMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-resend-contact-verification-code';
import useValidateVerificationCodeMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-validate-contact-verification-code';
import {
	RequestVerificationCodeParams,
	ValidateVerificationCodeParams,
	ResendVerificationCodeParams,
} from '../sites-overview/types';

export function useRequestVerificationCode(): {
	mutate: ( params: RequestVerificationCodeParams ) => void;
	isError: boolean;
	isLoading: boolean;
	isSuccess: boolean;
} {
	return useRequestContactVerificationCode( {
		retry: () => {
			return false;
		},
	} );
}

const verificationErrorMessages: { [ key: string ]: string } = {
	jetpack_agency_contact_invalid_verification_code: translate( 'Invalid Code' ),
	jetpack_agency_contact_expired_verification_code: translate( 'Code Expired' ),
};

export function useValidateVerificationCode(): {
	mutate: ( params: ValidateVerificationCodeParams ) => void;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	errorMessage?: string;
} {
	const data = useValidateVerificationCodeMutation( {
		retry: () => {
			return false;
		},
	} );
	let errorMessage;
	if ( data.isError ) {
		errorMessage = translate( 'Something went wrong. Please try again.' );
		const reasonCode = data?.error?.code;
		if ( reasonCode ) {
			errorMessage = verificationErrorMessages?.[ reasonCode ] || errorMessage;
		}
	}
	return { ...data, errorMessage };
}

export function useResendVerificationCode(): {
	mutate: ( params: ResendVerificationCodeParams ) => void;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
} {
	return useResendVerificationCodeMutation( {
		retry: () => {
			return false;
		},
	} );
}
