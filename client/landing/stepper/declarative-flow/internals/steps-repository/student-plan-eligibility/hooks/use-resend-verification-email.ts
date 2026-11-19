import { useState } from 'react';
import {
	resendAcceptedRetryAfter,
	resendThrottleRetryAfter,
} from 'calypso/dashboard/utils/email-verification-resend';
import { useResendCooldown } from 'calypso/dashboard/utils/use-resend-cooldown';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { STUDENT_ACTIVATION_EMAIL_SOURCE } from '../../../../flows/student/constants';

// `throttled` is a refusal, not a failure: the countdown says how long to wait.
export type ResendStatus = 'idle' | 'sending' | 'sent' | 'error' | 'throttled';

export function useResendVerificationEmail( onSent?: () => void ) {
	const sendVerificationEmail = useSendEmailVerification( {
		from: STUDENT_ACTIVATION_EMAIL_SOURCE,
	} );
	const { secondsUntilResend, hold } = useResendCooldown();
	const [ status, setStatus ] = useState< ResendStatus >( 'idle' );

	const resend = async () => {
		setStatus( 'sending' );

		try {
			const response = await sendVerificationEmail();
			if ( ! response?.success ) {
				throw new Error( 'unsuccessful_response' );
			}
			hold( resendAcceptedRetryAfter( response ) );
			setStatus( 'sent' );
			onSent?.();
		} catch ( error ) {
			const retryAfter = resendThrottleRetryAfter( error );
			if ( retryAfter !== null ) {
				hold( retryAfter );
			}
			setStatus( retryAfter !== null ? 'throttled' : 'error' );
		}
	};

	return { status, secondsUntilResend, resend };
}
