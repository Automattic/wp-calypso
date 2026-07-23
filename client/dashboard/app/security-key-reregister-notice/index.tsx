import { userPreferenceQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Notice } from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';

/**
 * Whether the security key re-register notice is eligible to show. Read at the
 * call site so the notice never decides its own visibility inside the arbiter.
 * See client/dashboard/sites/AGENTS.md.
 */
export function useShouldShowSecurityKeyReregisterNotice() {
	const { data: isReregisterRequired } = useSuspenseQuery(
		userPreferenceQuery( 'two_step_security_key_reregister_required' )
	);
	return isReregisterRequired;
}

export default function SecurityKeyReregisterNotice() {
	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_security_key_reregister_notice_impression" />
			<Notice
				variant="warning"
				title={ __( 'Your security key needs to be replaced' ) }
				actions={
					<RouterLinkButton to="/me/security/two-step-auth" variant="primary">
						{ __( 'Register a new key' ) }
					</RouterLinkButton>
				}
			>
				{ __(
					'There was an issue during setup, and your security key can’t be used to sign in. But don’t fret — your account is still secure.'
				) }
			</Notice>
		</>
	);
}
