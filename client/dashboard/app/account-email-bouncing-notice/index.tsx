import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Notice } from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { useAnalytics } from '../analytics';

/**
 * Whether the bouncing-account-email notice is eligible to show. Read at the call site so the
 * notice never decides its own visibility inside the arbiter.
 * See client/dashboard/sites/AGENTS.md.
 */
export function useShouldShowAccountEmailBouncingNotice() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	return !! userSettings.user_email_bouncing;
}

export default function AccountEmailBouncingNotice( {
	source,
}: {
	/** The page rendering the notice. Recorded on the impression and click events. */
	source: 'sites' | 'account';
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	// The account page holds the email field right below the notice, so a link back to it adds nothing.
	const showUpdateEmailAction = source !== 'account';

	const recordCtaClick = ( cta: 'update_email' | 'add_recovery_email' ) => {
		recordTracksEvent( 'calypso_dashboard_account_email_bouncing_notice_click', { cta, source } );
	};

	return (
		<>
			<ComponentViewTracker
				eventName="calypso_dashboard_account_email_bouncing_notice_impression"
				properties={ { source } }
			/>
			<Notice
				variant="warning"
				title={ __( 'Your account email isn’t receiving our messages' ) }
				actions={
					<>
						{ showUpdateEmailAction && (
							<RouterLinkButton
								to="/me/account"
								variant="primary"
								onClick={ () => recordCtaClick( 'update_email' ) }
							>
								{ __( 'Update your email address' ) }
							</RouterLinkButton>
						) }
						<RouterLinkButton
							to="/me/security/account-recovery"
							variant={ showUpdateEmailAction ? 'secondary' : 'primary' }
							onClick={ () => recordCtaClick( 'add_recovery_email' ) }
						>
							{ __( 'Add a recovery email' ) }
						</RouterLinkButton>
					</>
				}
			>
				{ sprintf(
					// translators: %s is the user's account email address.
					__(
						'Emails we send to %s are bouncing back, so you may not receive password resets or important account notices. Update your email address to make sure you can always get back into your account.'
					),
					userSettings.user_email
				) }
			</Notice>
		</>
	);
}
