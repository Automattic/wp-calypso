import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { key } from '@wordpress/icons';
import { siteJetpackModulesQuery } from '../../app/queries/site-jetpack-module';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { HostingFeatures, JetpackModules } from '../../data/constants';
import { hasHostingFeature } from '../../utils/site-features';
import type { Site } from '../../data/types';
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

	const ssoEnabled = jetpackModules?.includes( JetpackModules.SSO ) ?? false;

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
