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
import { useState, useEffect } from 'react';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import Notice from '../../../components/notice';
import type { UserSettings } from '@automattic/api-core';

// Get email verification params from URL
function getEmailVerificationParams() {
	if ( typeof window === 'undefined' ) {
		return {
			isEmailChangeComplete: false,
			isEmailVerificationComplete: false,
			emailChangeFailed: false,
			emailVerificationFailed: false,
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
	};
}

// Clean up email verification params from URL
function cleanUpEmailVerificationParams() {
	const params = new URLSearchParams( window.location.search );
	params.delete( 'new_email_result' );
	params.delete( 'verified' );
	const newUrl = window.location.pathname + ( params.toString() ? '?' + params.toString() : '' );
	window.history.replaceState( {}, '', newUrl );
}

interface EmailVerificationBannerProps {
	userSettings: UserSettings;
	isEmailVerified: boolean;
}

export default function EmailVerificationBanner( {
	userSettings,
	isEmailVerified,
}: EmailVerificationBannerProps ) {
	const { createErrorNotice } = useDispatch( noticesStore );
	const [ canResend, setCanResend ] = useState( true );

	// Extract verification params to avoid multiple URL parsing calls
	const {
		isEmailChangeComplete,
		isEmailVerificationComplete,
		emailChangeFailed,
		emailVerificationFailed,
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
	const shouldShowVerifyNotice = isEmailChangePending || ! isEmailVerified;
	const unverifiedEmail = isEmailChangePending ? pendingEmail : userSettings.user_email;

	useEffect( () => {
		// Handle error cases
		if ( emailChangeFailed || emailVerificationFailed ) {
			createErrorNotice(
				__( 'The email verification link is invalid or has expired. Please request a new one.' ),
				{ type: 'snackbar' }
			);
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
	] );

	const resendMutation = isEmailChangePending
		? resendEmailVerificationMutation( pendingEmail || '' )
		: sendEmailVerificationMutation();

	const { mutate: resendEmail, isPending: isResendPending } = useMutation( {
		...withSnackbar( resendMutation, {
			success: unverifiedEmail
				? sprintf(
						/* translators: %s is the email address awaiting verification */
						__( 'We sent an email to %s. Please check your inbox to verify your email.' ),
						unverifiedEmail
				  )
				: __( 'Verification email sent.' ),
			error: __( 'Failed to resend verification email.' ),
		} ),
		onSuccess: () => setCanResend( false ),
		onError: () => setCanResend( true ),
	} );

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
							variant="primary"
							__next40pxDefaultSize
							onClick={ () => resendEmail() }
							disabled={ isResendPending || ! canResend }
							isBusy={ isResendPending }
						>
							{ __( 'Resend email' ) }
						</Button>
						{ isEmailChangePending && (
							<Button
								variant="secondary"
								__next40pxDefaultSize
								onClick={ () => cancelPendingEmail() }
								disabled={ isCancelPending }
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
