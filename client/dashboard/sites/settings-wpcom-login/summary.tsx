import { HostingFeatures, JetpackModules } from '@automattic/api-core';
import { siteJetpackConnectionQuery, siteJetpackModulesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { key } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasHostingFeature } from '../../utils/site-features';
import {
	isJetpackModuleAvailable,
	isJetpackModuleActivated,
} from '../../utils/site-jetpack-modules';
import { isSimple } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function WpcomLoginSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const { data: jetpackModules } = useQuery( {
		...siteJetpackModulesQuery( site.ID ),
		enabled: ! isSimple( site ),
	} );
	const { data: jetpackConnection } = useQuery( {
		...siteJetpackConnectionQuery( site.ID ),
		enabled: ! isSimple( site ),
	} );

	const ssoAvailable = isJetpackModuleAvailable(
		jetpackModules,
		jetpackConnection,
		JetpackModules.SSO
	);

	const ssoEnabled = isJetpackModuleActivated( jetpackModules, JetpackModules.SSO );

	let badges;
	// Don't show any badge for Simple sites.
	if ( ! isSimple( site ) && ! ssoAvailable ) {
		badges = [ { text: __( 'Unavailable' ) } ];
	} else if ( ! isSimple( site ) && hasHostingFeature( site, HostingFeatures.SECURITY_SETTINGS ) ) {
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
