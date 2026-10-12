import {
	resendEmailVerificationMutation,
	sendEmailVerificationMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../../app/auth';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { Notice } from '../../../components/notice';
import {
	formatCooldown,
	resendAcceptedRetryAfter,
	RESEND_MIN_INTERVAL_SECONDS,
	resendThrottleRetryAfter,
} from '../../../utils/email-verification-resend';
import { useResendCooldown } from '../../../utils/use-resend-cooldown';

const sentToEmail = ( email: string ) =>
	sprintf(
		/* translators: %s is the email address awaiting verification */
		__( 'We sent an email to %s. Please check your inbox to verify your email.' ),
		email
	);

/**
 * The address waiting to be verified: the new one of a pending email change,
 * else the account email while it is unverified.
 */
export function useEmailToVerify() {
	const { user } = useAuth();
	const { data: userSettings, isLoading } = useQuery( userSettingsQuery() );
	const pendingEmail = userSettings?.new_user_email;
	const isEmailChangePending = !! userSettings?.user_email_change_pending && !! pendingEmail;

	let emailToVerify: string | null = null;
	if ( isEmailChangePending && pendingEmail ) {
		emailToVerify = pendingEmail;
	} else if ( ! user.email_verified ) {
		emailToVerify = user.email;
	}

	return { emailToVerify, isEmailChangePending, isLoading };
}

/**
 * Asks the user to verify their account email, or the new address of a
 * pending email change, and lets them resend the link.
 */
export default function EmailVerificationNotice() {
	const { user } = useAuth();
	const { emailToVerify, isEmailChangePending } = useEmailToVerify();
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
	// One wait per path: the server rate limits the dedicated send endpoint, and
	// re-saving a pending address is limited only by us.
	const originalCooldown = useResendCooldown();
	const pendingCooldown = useResendCooldown();
	const { secondsUntilResend } = isEmailChangePending ? pendingCooldown : originalCooldown;
	const isAwaitingResend = secondsUntilResend > 0;

	const pendingEmail = isEmailChangePending ? emailToVerify : null;
	const pendingEmailRef = useRef( pendingEmail );
	pendingEmailRef.current = pendingEmail;

	const { reset: resetPendingCooldown } = pendingCooldown;
	useEffect( () => {
		resetPendingCooldown();
	}, [ pendingEmail, resetPendingCooldown ] );

	const genericError = __( 'There was an error while resending the email. Please try again.' );

	const { mutate: sendToOriginal, isPending: isSendPending } = useMutation( {
		...withSnackbar( sendEmailVerificationMutation(), { success: sentToEmail( user.email ) } ),
		onSuccess: ( data ) => originalCooldown.hold( resendAcceptedRetryAfter( data ) ),
		onError: ( error ) => {
			const retryAfter = resendThrottleRetryAfter( error );
			if ( retryAfter !== null ) {
				originalCooldown.hold( retryAfter );
				createErrorNotice( __( 'Too many attempts. Please wait before trying again.' ), {
					type: 'snackbar',
				} );
				return;
			}
			createErrorNotice( genericError, { type: 'snackbar' } );
		},
	} );

	const { mutate: resendToPending, isPending: isResendPending } = useMutation( {
		...resendEmailVerificationMutation(),
		// The address is a mutation variable, so a late response names the address it was sent to.
		onSuccess: ( _data, email ) => {
			createSuccessNotice( sentToEmail( email ), { type: 'snackbar' } );
			// A wait is meaningless once the address has moved on.
			if ( email === pendingEmailRef.current ) {
				pendingCooldown.hold( RESEND_MIN_INTERVAL_SECONDS );
			}
		},
		onError: () => createErrorNotice( genericError, { type: 'snackbar' } ),
	} );

	if ( ! emailToVerify ) {
		return null;
	}

	const isSending = isSendPending || isResendPending;

	return (
		<Notice
			variant="warning"
			title={ __( 'Verify your email address' ) }
			actions={
				<Button
					variant="primary"
					size="compact"
					onClick={ () =>
						isEmailChangePending ? resendToPending( emailToVerify ) : sendToOriginal()
					}
					disabled={ isAwaitingResend || isSending }
					isBusy={ isSending }
				>
					{ isAwaitingResend
						? sprintf(
								/* translators: %s is a countdown to when the email can be resent, e.g. 4:59 */
								__( 'Resend email (%s)' ),
								formatCooldown( secondsUntilResend )
							)
						: __( 'Resend email' ) }
				</Button>
			}
		>
			{ sprintf(
				/* translators: %s is the email address awaiting verification */
				__(
					'We sent a verification link to %s. Please click the link in that email to verify your address.'
				),
				emailToVerify
			) }
		</Notice>
	);
}
