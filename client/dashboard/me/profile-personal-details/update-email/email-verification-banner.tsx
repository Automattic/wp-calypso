import { cancelPendingEmailChangeMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useConsumeSearchParams } from '../../../app/hooks/use-consume-search-params';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import Notice, { NoticeActionButton, RouterNoticeActionLink } from '../../../components/notice';
import { formatCooldown } from '../../../utils/email-verification-resend';
import { useEmailVerificationResend } from '../../../utils/use-email-verification-resend';
import { useIsEmailWritePending } from '../use-email-write-pending';
import type { UserSettings } from '@automattic/api-core';

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
	const { createErrorNotice } = useDispatch( noticesStore );
	const [ isSuccessNoticeDismissed, setIsSuccessNoticeDismissed ] = useState( false );
	const { new_email_result: newEmailResult, verified } = useConsumeSearchParams(
		[ 'new_email_result', 'verified', 'new_email_error' ],
		{
			onConsume: ( params ) => {
				setIsSuccessNoticeDismissed( false );
				if ( params.new_email_result === '0' || params.verified === '0' ) {
					createErrorNotice( emailChangeFailureMessage( params.new_email_error ?? null ), {
						type: 'snackbar',
					} );
				}
			},
		}
	);

	let verificationType: 'email_change' | 'verification' | null = null;
	if ( newEmailResult === '1' ) {
		verificationType = 'email_change';
	} else if ( verified === '1' ) {
		verificationType = 'verification';
	}
	const showSuccessNotice = verificationType !== null && ! isSuccessNoticeDismissed;

	const pendingEmail = userSettings.new_user_email;
	const isEmailChangePending = !! userSettings.user_email_change_pending && !! pendingEmail;
	const {
		resend: resendEmail,
		isSendPending,
		isResending: isResendPending,
		secondsUntilResend,
	} = useEmailVerificationResend( {
		originalEmail: userSettings.user_email,
		pendingEmail,
		isEmailChangePending,
		errorMessage: __( 'Failed to resend verification email.' ),
	} );
	const isAwaitingResend = secondsUntilResend > 0;
	const shouldShowVerifyNotice = isEmailChangePending || ! isEmailVerified;
	const unverifiedEmail = isEmailChangePending ? pendingEmail : userSettings.user_email;

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
				onClose={ () => setIsSuccessNoticeDismissed( true ) }
				actions={
					wasEmailChange ? (
						<RouterNoticeActionLink to="/domains/">
							{ __( 'Update domain contacts' ) }
						</RouterNoticeActionLink>
					) : null
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
		<Notice
			variant="warning"
			title={ __( 'Verify your email' ) }
			actions={
				<>
					<NoticeActionButton
						variant="solid"
						onClick={ resendEmail }
						disabled={ isEmailWritePending || isSendPending || isAwaitingResend }
						loading={ isResendPending }
					>
						{ isAwaitingResend
							? sprintf(
									/* translators: %s is a countdown to when the email can be resent, e.g. 4:59 */
									__( 'Resend email (%s)' ),
									formatCooldown( secondsUntilResend )
								)
							: __( 'Resend email' ) }
					</NoticeActionButton>
					{ isEmailChangePending && (
						<NoticeActionButton
							variant="outline"
							onClick={ () => cancelPendingEmail() }
							disabled={ isEmailWritePending }
							loading={ isCancelPending }
						>
							{ __( 'Cancel the pending email change' ) }
						</NoticeActionButton>
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
	);
}
