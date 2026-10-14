import { siteHourlyViewsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { StatsSparkline } from '../../components/stats-sparkline';
import type { Site } from '@automattic/api-core';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './plugin-stats-sparkline.scss';

/**
 * Draws the site admin bar's `stats` node, which decides whether the sparkline shows and where it links, as an SVG chart of the hourly views instead of the image wp-admin uses.
 * @returns The node builder, or undefined while there are no views to draw.
 */
export function useStatsSparklineNodeBuilder( {
	site,
	adminBarNodes,
}: {
	site?: Site;
	adminBarNodes: AdminBarNode[];
} ): ( () => Partial< OmnibarNode > ) | undefined {
	const hasStatsNode = adminBarNodes.some( ( node ) => node.id === 'stats' );

	const { data: hourlyViews } = useQuery( {
		...siteHourlyViewsQuery( site?.ID ?? 0 ),
		enabled: !! site && hasStatsNode,
	} );

	return useMemo( () => {
		if ( ! hasStatsNode || ! hourlyViews || hourlyViews.length === 0 ) {
			return undefined;
		}

		const label = __( 'Views over 48 hours. Click for more Stats.' );

		return () => ( {
			title: undefined,
			label,
			className: 'omnibar__stats-sparkline',
			render: () => (
				<>
					<StatsSparkline hourlyViews={ hourlyViews } />
					<span className="wpcom-stats-sparkline-accessible-label">{ label }</span>
				</>
			),
		} );
	}, [ hasStatsNode, hourlyViews ] );
}

/**
 * Leaves the `stats` node out until its builder can draw it, since without one it renders as the admin bar's image markup.
 */
export function removeUndrawnStatsNode(
	adminBarNodes: AdminBarNode[],
	statsSparklineNodeBuilder: ( () => Partial< OmnibarNode > ) | undefined
): AdminBarNode[] {
	return statsSparklineNodeBuilder
		? adminBarNodes
		: adminBarNodes.filter( ( node ) => node.id !== 'stats' );
}
