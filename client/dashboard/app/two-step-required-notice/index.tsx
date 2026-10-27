import { JetpackModules } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Notice } from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { hasJetpackModule } from '../../utils/site-features';
import { useAuth } from '../auth';
import type { Site } from '@automattic/api-core';

/**
 * Whether the user can't open the site in WP Admin without two-step authentication on their
 * account. The site setting only has an effect while the SSO module is active. Read at the
 * call site so the notice never decides its own visibility inside the arbiter. See
 * client/dashboard/sites/AGENTS.md.
 */
export function useSiteRequiresTwoStep( site: Site ) {
	const { user } = useAuth();
	return (
		user.two_step_enabled === false &&
		!! site.options?.jetpack_sso_require_two_step &&
		hasJetpackModule( site, JetpackModules.SSO )
	);
}

export default function TwoStepRequiredNotice( { site }: { site: Site } ) {
	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_two_step_required_notice_impression" />
			<Notice
				variant="warning"
				title={ __( 'Set up two-step authentication to access WP Admin' ) }
				actions={
					<RouterLinkButton to="/me/security/two-step-auth" variant="primary">
						{ __( 'Set up two-step authentication' ) }
					</RouterLinkButton>
				}
			>
				{ sprintf(
					/* translators: %s is the name of a site. */
					__(
						'%s requires two-step authentication. You can’t open its WP Admin until you turn it on for your account.'
					),
					site.name
				) }
			</Notice>
		</>
	);
}
