import useRequestContactVerificationCode from 'calypso/state/jetpack-agency-dashboard/hooks/use-request-contact-verification-code';
import useValidateVerificationCodeMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-validate-contact-verification-code';
import {
	RequestVerificationCodeParams,
	ValidateVerificationCodeParams,
} from '../sites-overview/types';

export function useRequestVerificationCode(): {
	requestVerificationCode: ( params: RequestVerificationCodeParams ) => void;
	isRequestingVerificationCode: boolean;
	isSuccess: boolean;
	requestingVerificationCodeFailed: boolean;
} {
	const { isLoading, isSuccess, isError, mutate } = useRequestContactVerificationCode( {
		retry: ( errorCount ) => {
			return errorCount < 3;
		},
	} );

	return {
		requestVerificationCode: mutate,
		isRequestingVerificationCode: isLoading,
		isSuccess,
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
		retry: ( errorCount ) => {
			return errorCount < 3;
		},
	} );

	return {
		validateVerificationCode: mutate,
		isValidating: isLoading,
		isVerified: isSuccess,
		validationFailed: isError,
	};
}
