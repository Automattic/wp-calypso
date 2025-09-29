import { userSettingsQuery, resendEmailVerificationMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useEffect } from 'react';
import Notice from '../../components/notice';

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

		if ( newEmailResult === '0' ) {
			createErrorNotice(
				__( 'The email verification link is invalid or has expired. Please request a new one.' ),
				{ type: 'snackbar' }
			);

			params.delete( 'new_email_result' );
			const newUrl =
				window.location.pathname + ( params.toString() ? '?' + params.toString() : '' );
			window.history.replaceState( {}, '', newUrl );
		} else if ( newEmailResult === '1' ) {
			setShowSuccessNotice( true );

			params.delete( 'new_email_result' );
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
		resendEmail( pendingEmail || '' );
	};

	if ( showSuccessNotice ) {
		return (
			<Notice
				variant="success"
				title={ __( 'Email address updated' ) }
				onClose={ () => setShowSuccessNotice( false ) }
				actions={
					<Button variant="link" href="/v2/domains/">
						{ __( 'Update domain contacts' ) }
					</Button>
				}
			>
				{ __( 'Make sure you update your contact information for any registered domains.' ) }
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
							{ __( 'Resend verification email' ) }
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
