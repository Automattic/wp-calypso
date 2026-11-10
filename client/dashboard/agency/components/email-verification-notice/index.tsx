import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { useAuth } from '../../../app/auth';
import { Notice, NoticeActionButton, NoticeActionLinkButton } from '../../../components/notice';
import { formatCooldown } from '../../../utils/email-verification-resend';
import { wpcomLink } from '../../../utils/link';
import { useEmailVerificationResend } from '../../../utils/use-email-verification-resend';

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

export default function EmailVerificationNotice() {
	const { user } = useAuth();
	const { emailToVerify, isEmailChangePending } = useEmailToVerify();
	const { resend, isResending, secondsUntilResend } = useEmailVerificationResend( {
		originalEmail: user.email,
		// Always false: a pending change links to WordPress.com below instead of re-saving here.
		isEmailChangePending: false,
		errorMessage: __( 'There was an error while resending the email. Please try again.' ),
	} );
	const isAwaitingResend = secondsUntilResend > 0;

	if ( ! emailToVerify ) {
		return null;
	}

	return (
		<Notice
			variant="warning"
			title={ __( 'Verify your email address' ) }
			actions={
				// Resending to a pending address re-saves it, which WordPress.com only accepts from
				// its own clients, so that resend happens there.
				isEmailChangePending ? (
					<NoticeActionLinkButton
						variant="solid"
						href={ wpcomLink( '/me' ) }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Resend email' ) }
					</NoticeActionLinkButton>
				) : (
					<NoticeActionButton
						variant="solid"
						onClick={ resend }
						disabled={ isAwaitingResend || isResending }
						loading={ isResending }
					>
						{ isAwaitingResend
							? sprintf(
									/* translators: %s is a countdown to when the email can be resent, e.g. 4:59 */
									__( 'Resend email (%s)' ),
									formatCooldown( secondsUntilResend )
								)
							: __( 'Resend email' ) }
					</NoticeActionButton>
				)
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
