import { useTranslate } from 'i18n-calypso';
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

export function useValidateVerificationCode(): {
	mutate: ( params: ValidateVerificationCodeParams ) => void;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	errorMessage?: string;
} {
	const translate = useTranslate();

	const data = useValidateVerificationCodeMutation( {
		retry: () => {
			return false;
		},
	} );
	let errorMessage = '';
	if ( data.isError && data.error?.data ) {
		const reasonCode = data.error.data.reason_code;
		if ( reasonCode === 'invalid_partner_authentication_token' ) {
			errorMessage = translate( 'Invalid Code' );
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
