import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAuth } from '../../../app/auth';
import { Notice } from '../../../components/notice';
import { formatCooldown } from '../../../utils/email-verification-resend';
import { wpcomLink } from '../../../utils/link';
import { useEmailVerificationResend } from '../../../utils/use-email-verification-resend';
import NewTabLabel from '../new-tab-label';

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
					<Button
						variant="primary"
						size="compact"
						href={ wpcomLink( '/me' ) }
						target="_blank"
						rel="noopener noreferrer"
						__next40pxDefaultSize
					>
						<NewTabLabel>{ __( 'Resend email' ) }</NewTabLabel>
					</Button>
				) : (
					<Button
						variant="primary"
						size="compact"
						onClick={ resend }
						disabled={ isAwaitingResend || isResending }
						isBusy={ isResending }
						__next40pxDefaultSize
					>
						{ isAwaitingResend
							? sprintf(
									/* translators: %s is a countdown to when the email can be resent, e.g. 4:59 */
									__( 'Resend email (%s)' ),
									formatCooldown( secondsUntilResend )
								)
							: __( 'Resend email' ) }
					</Button>
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
