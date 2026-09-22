import { __, sprintf } from '@wordpress/i18n';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Notice } from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { useAnalytics } from '../analytics';
import { useAuth } from '../auth';

/**
 * Whether the bouncing-account-email notice is eligible to show. Read at the call site so the
 * notice never decides its own visibility inside the arbiter.
 * See client/dashboard/sites/AGENTS.md.
 *
 * The flag rides on the authenticated user, which the dashboard already has before the first
 * paint, so eligibility costs no request and cannot arrive late.
 */
export function useShouldShowAccountEmailBouncingNotice() {
	const { user } = useAuth();
	return !! user.email_bouncing;
}

export default function AccountEmailBouncingNotice() {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();

	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_account_email_bouncing_notice_impression" />
			<Notice
				variant="warning"
				title={ __( 'Your account email isn’t receiving our messages' ) }
				actions={
					<RouterLinkButton
						to="/me/account"
						variant="primary"
						onClick={ () =>
							recordTracksEvent( 'calypso_dashboard_account_email_bouncing_notice_click' )
						}
					>
						{ __( 'Update your email address' ) }
					</RouterLinkButton>
				}
			>
				{ sprintf(
					// translators: %s is the user's account email address.
					__(
						'Emails we send to %s are bouncing back, so you may not receive password resets or important account notices. Update your email address to make sure you can always get back into your account.'
					),
					user.email
				) }
			</Notice>
		</>
	);
}
