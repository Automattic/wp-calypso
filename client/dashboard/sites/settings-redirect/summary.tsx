import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { globe } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SiteRedirectSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	if ( isDashboardBackport() ) {
		return null;
	}
	let badges = [];
	if ( site.options?.is_redirect ) {
		badges = [ { text: __( 'Enabled' ), intent: 'success' as const } ];
	} else {
		badges = [ { text: __( 'Disabled' ) } ];
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/site-redirect` }
			title={ __( 'Site redirect' ) }
			density={ density }
			decoration={ <Icon icon={ globe } /> }
			badges={ badges }
		/>
	);
}
