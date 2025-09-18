import { siteMetricsQuery } from '@automattic/api-queries';
import { PieChart } from '@automattic/charts';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import MonitoringCard from '../monitoring-card';
import type { PeriodData, TimeRange } from '../monitoring/types';
import type { Site } from '@automattic/api-core';

function convertTimeRangeToUnix( timeRange: number ): TimeRange {
	const start = Math.floor( new Date().getTime() / 1000 ) - timeRange * 3600;
	const end = Math.floor( new Date().getTime() / 1000 );

	return { start, end };
}

type SiteRequestMethodsData = {
	data: object[];
	isLoading: boolean;
};

function useSiteRequestMethodsData( siteId: number, timeRange: number ): SiteRequestMethodsData {
	const { start, end } = useMemo( () => convertTimeRangeToUnix( timeRange ), [ timeRange ] );

	const { data: requestMethodsData, isPending: isLoading } = useQuery(
		siteMetricsQuery( siteId, { start, end, metric: 'requests_persec', dimension: 'http_verb' } )
	);

	const formatData = ( requestMethodsData ) => {
		if ( ! requestMethodsData?.data?.periods ) {
			return [];
		}

		const methodsMap = {};

		requestMethodsData.data.periods.forEach( ( period: PeriodData ) => {
			if ( typeof period?.dimension === 'object' ) {
				Object.entries( period.dimension ).forEach( ( [ method, value ] ) => {
					if ( ! methodsMap[ method ] ) {
						methodsMap[ method ] = 0;
					}
					methodsMap[ method ] += value;
				} );
			}
		} );

		const sum = Object.values( methodsMap ).reduce( ( acc, curr ) => acc + curr, 0 );

		return Object.entries( methodsMap ).map( ( [ method, value ] ) => ( {
			label: method.toUpperCase(),
			value: Math.round( value * 100 ) / 100,
			percentage: Math.round( ( ( value * 100 ) / sum ) * 100 ) / 100,
		} ) );
	};

	return {
		data: formatData( requestMethodsData ),
		isLoading,
	};
}

export default function MonitoringRequestMethodsCard( {
	site,
	timeRange,
}: {
	site: Site;
	timeRange: number;
} ) {
	const { data, isLoading } = useSiteRequestMethodsData( site.ID, timeRange );

	return (
		<MonitoringCard
			title={ __( 'HTTP request methods' ) }
			description={ __( 'Percentage of traffic per HTTP request method.' ) }
			onDownloadClick={ () => {} }
			onAnchorClick={ () => {} }
			isLoading={ isLoading }
			className="dashboard-monitoring-card--row-layout"
		>
			<PieChart
				thickness={ 0.3 }
				className="dashboard-monitoring-card__donut-chart"
				data={ data }
				legendAlignmentVertical="top"
				legendOrientation="horizontal"
				legendShape="line"
				legendAlignmentHorizontal="left"
				showLegend
				withLegendGlyph
				withTooltips
			/>
		</MonitoringCard>
	);
}
