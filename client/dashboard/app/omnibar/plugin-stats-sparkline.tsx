import { JetpackModules } from '@automattic/api-core';
import { siteHourlyViewsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { StatsSparkline } from '../../components/stats-sparkline';
import { hasJetpackModule } from '../../utils/site-features';
import type { Site } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

import './plugin-stats-sparkline.scss';

export function useStatsSparklinePlugin( { site }: { site?: Site } ): OmnibarNode | undefined {
	const adminUrl = site?.options?.admin_url;
	// The sparkline links to admin.php?page=stats, which isn't registered for a user without
	// view_stats, nor on a Jetpack site with the Stats module switched off.
	const canViewStats =
		!! site?.capabilities?.view_stats &&
		( ! site.jetpack || !! hasJetpackModule( site, JetpackModules.STATS ) );

	const { data: hourlyViews } = useQuery( {
		...siteHourlyViewsQuery( site?.ID ?? 0 ),
		enabled: canViewStats,
	} );

	if ( ! adminUrl || ! canViewStats || ! hourlyViews || hourlyViews.length === 0 ) {
		return undefined;
	}

	const label = __( 'Views over 48 hours. Click for more Stats.' );

	return {
		id: 'stats',
		href: `${ adminUrl }admin.php?page=stats`,
		label,
		className: 'omnibar__stats-sparkline',
		render: () => (
			<>
				<StatsSparkline hourlyViews={ hourlyViews } />
				<span className="wpcom-stats-sparkline-accessible-label">{ label }</span>
			</>
		),
	};
}
