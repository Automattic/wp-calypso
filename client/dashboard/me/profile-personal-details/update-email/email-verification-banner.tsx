import {
	cancelPendingEmailChangeMutation,
	resendEmailVerificationMutation,
	sendEmailVerificationMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useEffect, useRef } from 'react';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import Notice from '../../../components/notice';
import {
	formatCooldown,
	resendAcceptedRetryAfter,
	RESEND_MIN_INTERVAL_SECONDS,
	resendThrottleRetryAfter,
} from '../../../utils/email-verification-resend';
import { useResendCooldown } from '../../../utils/use-resend-cooldown';
import { useIsEmailWritePending } from '../use-email-write-pending';
import type { UserSettings } from '@automattic/api-core';

// Get email verification params from URL
function getEmailVerificationParams() {
	if ( typeof window === 'undefined' ) {
		return {
			isEmailChangeComplete: false,
			isEmailVerificationComplete: false,
			emailChangeFailed: false,
			emailVerificationFailed: false,
			emailChangeError: null,
		};
	}
	const params = new URLSearchParams( window.location.search );
	const newEmailResult = params.get( 'new_email_result' );
	const verified = params.get( 'verified' );

	return {
		isEmailChangeComplete: newEmailResult === '1',
		isEmailVerificationComplete: verified === '1',
		emailChangeFailed: newEmailResult === '0',
		emailVerificationFailed: verified === '0',
		emailChangeError: params.get( 'new_email_error' ),
	};
}

// Clean up email verification params from URL
function cleanUpEmailVerificationParams() {
	const params = new URLSearchParams( window.location.search );
	params.delete( 'new_email_result' );
	params.delete( 'new_email_error' );
	params.delete( 'verified' );
	const newUrl = window.location.pathname + ( params.toString() ? '?' + params.toString() : '' );
	window.history.replaceState( {}, '', newUrl );
}

// An unrecognised or absent reason falls back to the generic message, so the server can start
// sending one without waiting on this.
function emailChangeFailureMessage( emailChangeError: string | null ) {
	if ( emailChangeError === 'email_in_use' ) {
		return __(
			'That email address is already used by another WordPress.com account. Try a different address.'
		);
	}
	return __( 'The email verification link is invalid or has expired. Please request a new one.' );
}

interface EmailVerificationBannerProps {
	userSettings: UserSettings;
	isEmailVerified: boolean;
}

export default function EmailVerificationBanner( {
	userSettings,
	isEmailVerified,
}: EmailVerificationBannerProps ) {
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );

	// Extract verification params to avoid multiple URL parsing calls
	const {
		isEmailChangeComplete,
		isEmailVerificationComplete,
		emailChangeFailed,
		emailVerificationFailed,
		emailChangeError,
	} = getEmailVerificationParams();

	const [ showSuccessNotice, setShowSuccessNotice ] = useState( () => {
		return isEmailChangeComplete || isEmailVerificationComplete;
	} );

	const [ verificationType ] = useState< 'email_change' | 'verification' | null >( () => {
		if ( isEmailChangeComplete ) {
			return 'email_change';
		}
		if ( isEmailVerificationComplete ) {
			return 'verification';
		}

		return null;
	} );

	const pendingEmail = userSettings.new_user_email;
	const isEmailChangePending = !! userSettings.user_email_change_pending && !! pendingEmail;
	// One wait per path: the server rate limits the dedicated endpoint, and re-saving a pending
	// address is limited only by us.
	const originalCooldown = useResendCooldown();
	const pendingCooldown = useResendCooldown();
	const { secondsUntilResend } = isEmailChangePending ? pendingCooldown : originalCooldown;
	const isAwaitingResend = secondsUntilResend > 0;

	const pendingEmailRef = useRef( pendingEmail );
	pendingEmailRef.current = pendingEmail;

	const { reset: resetPendingCooldown } = pendingCooldown;
	useEffect( () => {
		resetPendingCooldown();
	}, [ pendingEmail, resetPendingCooldown ] );
	const shouldShowVerifyNotice = isEmailChangePending || ! isEmailVerified;
	const unverifiedEmail = isEmailChangePending ? pendingEmail : userSettings.user_email;

	useEffect( () => {
		// Handle error cases
		if ( emailChangeFailed || emailVerificationFailed ) {
			createErrorNotice( emailChangeFailureMessage( emailChangeError ), { type: 'snackbar' } );
		}

		// Clean up URL params if any verification params were present
		if (
			isEmailChangeComplete ||
			isEmailVerificationComplete ||
			emailChangeFailed ||
			emailVerificationFailed
		) {
			cleanUpEmailVerificationParams();
		}
	}, [
		createErrorNotice,
		isEmailChangeComplete,
		isEmailVerificationComplete,
		emailChangeFailed,
		emailVerificationFailed,
		emailChangeError,
	] );

	// One mutation per endpoint: TanStack hands a request in flight whatever options the latest
	// render produced, so a shared one settles against the wrong endpoint's callbacks and copy.
	const sentToEmail = ( email?: string ) =>
		email
			? sprintf(
					/* translators: %s is the email address awaiting verification */
					__( 'We sent an email to %s. Please check your inbox to verify your email.' ),
					email
			  )
			: __( 'Verification email sent.' );

	// Honour a refusal whenever it lands, but only mention it while that endpoint is on screen,
	// or the notice contradicts an enabled button.
	const isThrottledPathActiveRef = useRef( ! isEmailChangePending );
	isThrottledPathActiveRef.current = ! isEmailChangePending;

	const { mutate: sendToOriginal, isPending: isSendPending } = useMutation( {
		...withSnackbar( sendEmailVerificationMutation(), {
			success: sentToEmail( userSettings.user_email ),
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
			createErrorNotice( __( 'Failed to resend verification email.' ), { type: 'snackbar' } );
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
		onError: () =>
			createErrorNotice( __( 'Failed to resend verification email.' ), { type: 'snackbar' } ),
	} );

	const resendEmail = () =>
		isEmailChangePending ? resendToPending( pendingEmail || '' ) : sendToOriginal();
	const isResendPending = isSendPending || isPendingResendPending;
	const isEmailWritePending = useIsEmailWritePending();

	const { mutate: cancelPendingEmail, isPending: isCancelPending } = useMutation(
		withSnackbar( cancelPendingEmailChangeMutation(), {
			success: __( 'Pending email change canceled.' ),
			error: __( 'Failed to cancel pending email change.' ),
		} )
	);

	if ( showSuccessNotice ) {
		const wasEmailChange = verificationType === 'email_change';
		const wasVerification = verificationType === 'verification';

		let title;
		if ( wasEmailChange ) {
			title = __( 'Email address updated' );
		} else if ( wasVerification ) {
			title = __( 'Email verified' );
		}

		return (
			<Notice
				variant="success"
				title={ title }
				onClose={ () => setShowSuccessNotice( false ) }
				actions={
					wasEmailChange ? <Link to="/domains/">{ __( 'Update domain contacts' ) }</Link> : null
				}
			>
				{ wasEmailChange
					? __( 'Make sure you update your contact information for any registered domains.' )
					: __( 'Your email address has been verified successfully.' ) }
			</Notice>
		);
	}

	// Show the verification notice for a pending change or an unverified account email.
	if ( ! shouldShowVerifyNotice || ! unverifiedEmail ) {
		return null;
	}

	return (
		<>
			<Notice
				variant="warning"
				title={ __( 'Verify your email' ) }
				actions={
					<>
						<Button
							className="dashboard-email-verification-resend"
							variant="primary"
							__next40pxDefaultSize
							onClick={ resendEmail }
							disabled={ isEmailWritePending || isSendPending || isAwaitingResend }
							isBusy={ isResendPending }
						>
							{ isAwaitingResend
								? sprintf(
										/* translators: %s is a countdown to when the email can be resent, e.g. 4:59 */
										__( 'Resend email (%s)' ),
										formatCooldown( secondsUntilResend )
								  )
								: __( 'Resend email' ) }
						</Button>
						{ isEmailChangePending && (
							<Button
								variant="secondary"
								__next40pxDefaultSize
								onClick={ () => cancelPendingEmail() }
								disabled={ isEmailWritePending }
								isBusy={ isCancelPending }
							>
								{ __( 'Cancel the pending email change' ) }
							</Button>
						) }
					</>
				}
			>
				{ createInterpolateElement(
					sprintf(
						/* translators: %s is the email address awaiting verification */
						__(
							'Check your inbox at <strong>%s</strong> for the confirmation email, or click "Resend email" to get a new one.'
						),
						unverifiedEmail
					),
					{
						strong: <strong />,
					}
				) }
			</Notice>
		</>
	);
}
