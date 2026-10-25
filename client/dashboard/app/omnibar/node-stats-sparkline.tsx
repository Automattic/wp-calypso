import { siteHourlyViewsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { StatsSparkline } from '../../components/stats-sparkline';
import type { OmnibarNode } from '@automattic/omnibar';

import './node-stats-sparkline.scss';

function StatsSparklineNodeContent( { siteId, label }: { siteId: number; label: string } ) {
	const { data: hourlyViews } = useSuspenseQuery( siteHourlyViewsQuery( siteId ) );

	return (
		<>
			<StatsSparkline hourlyViews={ hourlyViews } />
			<span className="wpcom-stats-sparkline-accessible-label">{ label }</span>
		</>
	);
}

/**
 * Draws the site admin bar's `stats` node, which decides whether the sparkline shows and where it links, as an SVG chart of the hourly views instead of the image wp-admin uses.
 */
export function createStatsSparklineNodeBuilder( { siteId }: { siteId?: number | null } ) {
	return (): Partial< OmnibarNode > | null => {
		if ( ! siteId ) {
			return null;
		}

		const label = __( 'Views over 48 hours. Click for more Stats.' );

		return {
			title: undefined,
			label,
			className: 'omnibar__stats-sparkline',
			render: () => <StatsSparklineNodeContent siteId={ siteId } label={ label } />,
		};
	};
}
