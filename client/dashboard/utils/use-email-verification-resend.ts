import {
	resendEmailVerificationMutation,
	sendEmailVerificationMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useRef } from 'react';
import { withSnackbar } from '../app/snackbars/with-snackbar';
import {
	resendAcceptedRetryAfter,
	RESEND_MIN_INTERVAL_SECONDS,
	resendThrottleRetryAfter,
} from './email-verification-resend';
import { useResendCooldown } from './use-resend-cooldown';

const sentToEmail = ( email?: string ) =>
	email
		? sprintf(
				/* translators: %s is the email address awaiting verification */
				__( 'We sent an email to %s. Please check your inbox to verify your email.' ),
				email
			)
		: __( 'Verification email sent.' );

interface Options {
	originalEmail?: string;
	pendingEmail?: string;
	isEmailChangePending: boolean;
	errorMessage: string;
}

// Shared so every "Resend email" button rate limits the same way.
export function useEmailVerificationResend( {
	originalEmail,
	pendingEmail,
	isEmailChangePending,
	errorMessage,
}: Options ) {
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );

	// One wait per path: the server rate limits the dedicated endpoint, and re-saving a pending
	// address is limited only by us.
	const originalCooldown = useResendCooldown();
	const pendingCooldown = useResendCooldown();
	const { secondsUntilResend } = isEmailChangePending ? pendingCooldown : originalCooldown;

	const pendingEmailRef = useRef( pendingEmail );
	pendingEmailRef.current = pendingEmail;

	const { reset: resetPendingCooldown } = pendingCooldown;
	useEffect( () => {
		resetPendingCooldown();
	}, [ pendingEmail, resetPendingCooldown ] );

	// Honour a refusal whenever it lands, but only mention it while that endpoint is on screen,
	// or the notice contradicts an enabled button.
	const isThrottledPathActiveRef = useRef( ! isEmailChangePending );
	isThrottledPathActiveRef.current = ! isEmailChangePending;

	// One mutation per endpoint: TanStack hands a request in flight whatever options the latest
	// render produced, so a shared one settles against the wrong endpoint's callbacks and copy.
	const { mutate: sendToOriginal, isPending: isSendPending } = useMutation( {
		...withSnackbar( sendEmailVerificationMutation(), {
			success: sentToEmail( originalEmail ),
		} ),
		onSuccess: ( data ) => originalCooldown.hold( resendAcceptedRetryAfter( data ) ),
		onError: ( error ) => {
			const retryAfter = resendThrottleRetryAfter( error );
			if ( retryAfter !== null ) {
				originalCooldown.hold( retryAfter );
				if ( isThrottledPathActiveRef.current ) {
					createErrorNotice( __( 'Too many attempts. Please wait before trying again.' ), {
						type: 'snackbar',
					} );
				}
				return;
			}
			createErrorNotice( errorMessage, { type: 'snackbar' } );
		},
	} );

	// The address is a mutation variable, so a response that lands late is still reported against
	// the address it was sent to rather than whichever one is on screen by then.
	const { mutate: resendToPending, isPending: isPendingResendPending } = useMutation( {
		...resendEmailVerificationMutation(),
		// Deliberately not passed to `mutate()`, where these would usually go: TanStack skips
		// per-call callbacks once the observer loses its listeners, so a resend outliving the
		// banner would report nothing at all.
		onSuccess: ( _data, email ) => {
			createSuccessNotice( sentToEmail( email ), { type: 'snackbar' } );
			// A wait is meaningless once the address has moved on.
			if ( email === pendingEmailRef.current ) {
				pendingCooldown.hold( RESEND_MIN_INTERVAL_SECONDS );
			}
		},
		onError: () => createErrorNotice( errorMessage, { type: 'snackbar' } ),
	} );

	const resend = () =>
		isEmailChangePending ? resendToPending( pendingEmail || '' ) : sendToOriginal();

	return {
		resend,
		isSendPending,
		isResending: isSendPending || isPendingResendPending,
		secondsUntilResend,
	};
}
