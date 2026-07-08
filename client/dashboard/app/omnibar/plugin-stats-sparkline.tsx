import { siteHourlyViewsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { StatsSparkline } from '../../components/stats-sparkline';
import type { Site } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

import './stats-sparkline.scss';

export function useStatsSparklinePlugin( {
	siteId,
	site,
}: {
	siteId?: number | null;
	site?: Site;
} ): OmnibarNode | undefined {
	const { data: hourlyViews } = useQuery( {
		...siteHourlyViewsQuery( siteId ?? 0 ),
		enabled: !! siteId,
	} );

	const adminUrl = site?.options?.admin_url;

	if ( ! adminUrl || ! hourlyViews || hourlyViews.length === 0 ) {
		return undefined;
	}

	const label = __( 'Views over 48 hours. Click for more Stats.' );

	return {
		id: 'stats',
		href: `${ adminUrl }admin.php?page=stats`,
		label,
		render: () => (
			<>
				<StatsSparkline hourlyViews={ hourlyViews } />
				<span className="wpcom-stats-sparkline-accessible-label">{ label }</span>
			</>
		),
	};
}
