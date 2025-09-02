import { HostingFeatures, JetpackModules } from '@automattic/api-core';
import { siteJetpackModulesQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { key } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasHostingFeature } from '../../utils/site-features';
import { isJetpackModuleActivated } from '../../utils/site-jetpack-modules';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function WpcomLoginSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const { data: jetpackModules } = useQuery( siteJetpackModulesQuery( site.ID ) );

	if ( ! isEnabled( 'dashboard/v2/security-settings' ) ) {
		return null;
	}

	const ssoEnabled = isJetpackModuleActivated( jetpackModules, JetpackModules.SSO );

	let badges;
	if ( hasHostingFeature( site, HostingFeatures.SECURITY_SETTINGS ) ) {
		badges = ssoEnabled
			? [ { text: __( 'Enabled' ), intent: 'success' as const } ]
			: [ { text: __( 'Disabled' ) } ];
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/wpcom-login` }
			title={ __( 'WordPress.com login' ) }
			density={ density }
			decoration={ <Icon icon={ key } /> }
			badges={ badges }
		/>
	);
}
