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
	const { isError, isLoading, isSuccess, mutate } = useRequestContactVerificationCode();

	return {
		mutate,
		isError,
		isLoading,
		isSuccess,
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
