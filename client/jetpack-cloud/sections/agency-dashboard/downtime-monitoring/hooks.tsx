import useRequestContactVerificationCode from 'calypso/state/jetpack-agency-dashboard/hooks/use-request-contact-verification-code';
import useResendVerificationCodeMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-resend-contact-verification-code';
import useValidateVerificationCodeMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-validate-contact-verification-code';
import {
	RequestVerificationCodeParams,
	ValidateVerificationCodeParams,
	ResendVerificationCodeParams,
} from '../sites-overview/types';

export function useRequestVerificationCode(): {
	requestVerificationCode: ( params: RequestVerificationCodeParams ) => void;
	requestingVerificationCodeFailed: boolean;
} {
	const { isError, mutate } = useRequestContactVerificationCode( {
		retry: () => {
			return false;
		},
	} );

	return {
		requestVerificationCode: mutate,
		requestingVerificationCodeFailed: isError,
	};
}

export function useValidateVerificationCode(): {
	validateVerificationCode: ( params: ValidateVerificationCodeParams ) => void;
	isValidating: boolean;
	isVerified: boolean;
	validationFailed: boolean;
} {
	const { isLoading, isSuccess, isError, mutate } = useValidateVerificationCodeMutation( {
		retry: () => {
			return false;
		},
	} );

	return {
		validateVerificationCode: mutate,
		isValidating: isLoading,
		isVerified: isSuccess,
		validationFailed: isError,
	};
}

export function useResendVerificationCode(): {
	resendVerificationCode: ( params: ResendVerificationCodeParams ) => void;
	isResending: boolean;
	resendSuccess: boolean;
	resendingFailed: boolean;
} {
	const { isLoading, isSuccess, isError, mutate } = useResendVerificationCodeMutation( {
		retry: () => {
			return false;
		},
	} );

	return {
		resendVerificationCode: mutate,
		isResending: isLoading,
		resendSuccess: isSuccess,
		resendingFailed: isError,
	};
}
