import { JetpackModules } from '@automattic/api-core';
import { siteJetpackConnectionQuery, siteJetpackModulesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { notAllowed } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { isJetpackModuleAvailable } from '../../utils/site-jetpack-modules';
import { isSimple } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function WebApplicationFirewallSettingsSummary( {
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

	const modulesAvailable =
		isJetpackModuleAvailable( jetpackModules, jetpackConnection, JetpackModules.WAF ) &&
		isJetpackModuleAvailable( jetpackModules, jetpackConnection, JetpackModules.PROTECT );

	// Don't show any badge for Simple sites.
	const badges =
		isSimple( site ) || modulesAvailable ? undefined : [ { text: __( 'Unavailable' ) } ];

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/web-application-firewall` }
			title={ __( 'Web Application Firewall (WAF)' ) }
			density={ density }
			decoration={ <Icon icon={ notAllowed } /> }
			badges={ badges }
		/>
	);
}
