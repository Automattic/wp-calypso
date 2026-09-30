import { JetpackModules } from '@automattic/api-core';
import { siteHourlyViewsQuery, sitePremiumAnalyticsEnabledQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { StatsSparkline } from '../../components/stats-sparkline';
import { hasJetpackModule } from '../../utils/site-features';
import type { Site } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

import './plugin-stats-sparkline.scss';

const STATS_PATH = 'admin.php?page=stats';
const PREMIUM_ANALYTICS_PATH = 'admin.php?page=jetpack-premium-analytics-wp-admin';

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

	// Core's settings route answers only to manage_options, so anyone else keeps the Stats link.
	const { data: isPremiumAnalyticsEnabled } = useQuery( {
		...sitePremiumAnalyticsEnabledQuery( site?.ID ?? 0 ),
		enabled: canViewStats && !! site?.capabilities?.manage_options,
	} );

	if ( ! adminUrl || ! canViewStats || ! hourlyViews || hourlyViews.length === 0 ) {
		return undefined;
	}

	const label = __( 'Views over 48 hours. Click for more Stats.' );

	return {
		id: 'stats',
		href: `${ adminUrl }${ isPremiumAnalyticsEnabled ? PREMIUM_ANALYTICS_PATH : STATS_PATH }`,
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
