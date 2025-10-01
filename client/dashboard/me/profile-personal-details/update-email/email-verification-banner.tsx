import { userSettingsQuery, resendEmailVerificationMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useEffect } from 'react';
import Notice from '../../../components/notice';

export default function EmailVerificationBanner() {
	const { data: userData } = useSuspenseQuery( userSettingsQuery() );
	const { createErrorNotice } = useDispatch( noticesStore );
	const [ showResendButton, setShowResendButton ] = useState( true );
	const [ showSuccessNotice, setShowSuccessNotice ] = useState( false );

	const isEmailPending = userData.user_email_change_pending;
	const pendingEmail = userData.new_user_email;

	// Handle verification success/error
	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}

		const params = new URLSearchParams( window.location.search );
		const newEmailResult = params.get( 'new_email_result' );
		const verified = params.get( 'verified' );

		// Handle error cases
		if ( newEmailResult === '0' || verified === '0' ) {
			createErrorNotice(
				__( 'The email verification link is invalid or has expired. Please request a new one.' ),
				{ type: 'snackbar' }
			);

			// Clean up URL params
			params.delete( 'new_email_result' );
			params.delete( 'verified' );
			const newUrl =
				window.location.pathname + ( params.toString() ? '?' + params.toString() : '' );
			window.history.replaceState( {}, '', newUrl );
		}

		// Handle success cases
		else if ( newEmailResult === '1' || verified === '1' ) {
			setShowSuccessNotice( true );

			// Clean up URL params
			params.delete( 'new_email_result' );
			params.delete( 'verified' );
			const newUrl =
				window.location.pathname + ( params.toString() ? '?' + params.toString() : '' );
			window.history.replaceState( {}, '', newUrl );
		}
	}, [ createErrorNotice ] );

	// Resend email
	const { mutate: resendEmail, isPending: isResendPending } = useMutation( {
		...resendEmailVerificationMutation(),
		onSuccess: () => {
			setShowResendButton( false );
		},
		onError: () => {
			setShowResendButton( true );
		},
		meta: {
			snackbar: {
				success: pendingEmail
					? sprintf(
							/* translators: %s is the user's new email address they're trying to change to */
							__( 'We sent an email to %s. Please check your inbox to verify your email.' ),
							pendingEmail
					  )
					: __( 'Verification email sent.' ),
				error: __( 'Failed to resend verification email.' ),
			},
		},
	} );

	const handleResendEmail = () => {
		if ( ! pendingEmail ) {
			return;
		}
		resendEmail( pendingEmail );
	};

	if ( showSuccessNotice ) {
		// Check URL params to determine the message type
		const params = new URLSearchParams( window.location.search );
		const wasEmailChange = params.get( 'new_email_result' ) === '1'; // Users changing their email and verifying the new one
		const wasVerification = params.get( 'verified' ) === '1'; //  New users verifying their email for the first time

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

	// Show pending email verification notice
	if ( ! isEmailPending || ! pendingEmail ) {
		return null;
	}

	return (
		<>
			<Notice
				variant="warning"
				title={ __( 'Verify your email' ) }
				actions={
					showResendButton && (
						<Button variant="link" onClick={ handleResendEmail } disabled={ isResendPending }>
							{ __( 'Resend email' ) }
						</Button>
					)
				}
			>
				{ createInterpolateElement(
					sprintf(
						/* translators: %s is the user's new email address they're trying to change to */
						__(
							'Check your inbox at <strong>%s</strong> for the confirmation email, or click "Resend email" to get a new one.'
						),
						pendingEmail
					),
					{
						strong: <strong />,
					}
				) }
			</Notice>
		</>
	);
}
