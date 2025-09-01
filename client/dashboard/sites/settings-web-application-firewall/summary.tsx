import { isEnabled } from '@automattic/calypso-config';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { notAllowed } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function WebApplicationFirewallSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	if ( ! isEnabled( 'dashboard/v2/security-settings' ) ) {
		return null;
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/web-application-firewall` }
			title={ __( 'Web Application Firewall (WAF)' ) }
			density={ density }
			decoration={ <Icon icon={ notAllowed } /> }
		/>
	);
}
