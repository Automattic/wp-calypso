import { HostingFeatures } from '@automattic/api-core';
import { siteCrontabsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { scheduled } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { hasHostingFeature } from '../../utils/site-features';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function CrontabSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const hasSshFeature = hasHostingFeature( site, HostingFeatures.SSH );

	const { data: crontabs } = useQuery( {
		...siteCrontabsQuery( site.ID ),
		enabled: hasSshFeature,
	} );

	if ( isDashboardBackport() ) {
		return null;
	}

	const crontabCount = crontabs?.length ?? 0;

	const badges = [
		// If SSH feature is not enabled, don't show the badge
		// Note: we should not `if (! hasSshFeature) { return null; }` above, because we have `Upgrade plan` screen to engage users to upgrade their plan.
		hasSshFeature && {
			text:
				crontabCount > 0
					? sprintf(
							/* translators: %d is the number of scheduled jobs */
							_n( '%d scheduled job', '%d scheduled jobs', crontabCount ),
							crontabCount
					  )
					: __( 'No scheduled jobs' ),
			intent: crontabCount > 0 ? ( 'success' as const ) : undefined,
		},
	].filter( ( badge ) => !! badge );

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/crontab` }
			title={ __( 'Cron' ) }
			density={ density }
			decoration={ <Icon icon={ scheduled } /> }
			badges={ badges }
		/>
	);
}
