import { siteHourlyViewsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { StatsSparkline } from '../../components/stats-sparkline';
import type { Site } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

import './plugin-stats-sparkline.scss';

export function useStatsSparklinePlugin( { site }: { site?: Site } ): OmnibarNode | undefined {
	const adminUrl = site?.options?.admin_url;
	const canViewStats = !! site?.capabilities?.view_stats;

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
