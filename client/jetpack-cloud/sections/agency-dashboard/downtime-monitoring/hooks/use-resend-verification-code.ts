import useResendVerificationCodeMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-resend-contact-verification-code';
import type { ResendVerificationCodeParams } from '../../sites-overview/types';

export default function useResendVerificationCode(): {
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
