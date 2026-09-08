import { __, sprintf } from '@wordpress/i18n';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Notice } from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { useAnalytics } from '../analytics';
import { useAuth } from '../auth';

/**
 * Whether the recovery-email-matches-account-email notice is eligible to show. Read at the call
 * site so the notice never decides its own visibility inside the arbiter.
 * See client/dashboard/sites/AGENTS.md.
 */
export function useShouldShowRecoveryEmailMatchesAccountEmailNotice() {
	const { user } = useAuth();
	return !! user.recovery_email_matches_account_email;
}

export default function RecoveryEmailMatchesAccountEmailNotice() {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();

	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_recovery_email_matches_account_email_notice_impression" />
			<Notice
				variant="warning"
				title={ __( 'Your recovery email is the same as your account email' ) }
				actions={
					<RouterLinkButton
						to="/me/security/account-recovery"
						variant="primary"
						onClick={ () =>
							recordTracksEvent(
								'calypso_dashboard_recovery_email_matches_account_email_notice_click'
							)
						}
					>
						{ __( 'Update recovery email' ) }
					</RouterLinkButton>
				}
			>
				{ sprintf(
					// translators: %s is the user's account email address.
					__(
						'Your recovery email %s is the address you sign in with, so losing access to it locks you out of your account. Set a different one so we can always reach you.'
					),
					user.email
				) }
			</Notice>
		</>
	);
}
