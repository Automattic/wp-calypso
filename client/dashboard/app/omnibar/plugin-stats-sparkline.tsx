import { siteHourlyViewsQuery } from '@automattic/api-queries';
import { StatsSparkline } from '@automattic/omnibar';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import type { Site } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

import './stats-sparkline.scss';

/**
 * The /sites/%s/admin-bar endpoint's node allowlist doesn't include "stats"
 * (it's only added by Jetpack's own stats_admin_bar_menu, which has no
 * parent, so the endpoint's ancestor-walk filter drops it entirely) — so
 * unlike the other omnibar nodes, this one is built independently of that
 * endpoint's data rather than sourced from it.
 */
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

	return {
		id: 'stats',
		href: `${ adminUrl }admin.php?page=stats`,
		label: __( 'Views over 48 hours. Click for more Stats.' ),
		render: () => <StatsSparkline hourlyViews={ hourlyViews } />,
	};
}
