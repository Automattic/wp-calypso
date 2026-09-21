import { JetpackModules } from '@automattic/api-core';
import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Notice } from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { hasJetpackModule } from '../../utils/site-features';
import type { Site } from '@automattic/api-core';

/**
 * Sites the user can't open in WP Admin without two-step authentication on their account.
 * The setting only has an effect while the SSO module is active.
 */
export function getSitesRequiringTwoStep( sites: Site[] ) {
	return sites.filter(
		( site ) =>
			!! site.options?.jetpack_sso_require_two_step && hasJetpackModule( site, JetpackModules.SSO )
	);
}

/**
 * Whether the two-step-required notice is eligible to show. Read at the call site so the
 * notice never decides its own visibility inside the arbiter.
 * See client/dashboard/sites/AGENTS.md.
 */
export function useShouldShowTwoStepRequiredNotice( sites: Site[] ) {
	const { data: userSettings } = useQuery( userSettingsQuery() );
	if ( ! userSettings || userSettings.two_step_enabled ) {
		return false;
	}
	return getSitesRequiringTwoStep( sites ).length > 0;
}

export default function TwoStepRequiredNotice( { sites }: { sites: Site[] } ) {
	const [ site ] = sites;
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
				{ sites.length === 1
					? sprintf(
							/* translators: %s is the name of a site. */
							__(
								'%s requires two-step authentication. You can’t open its WP Admin until you turn it on for your account.'
							),
							site.name
					  )
					: __(
							'Some of your sites require two-step authentication. You can’t open their WP Admin until you turn it on for your account.'
					  ) }
			</Notice>
		</>
	);
}
