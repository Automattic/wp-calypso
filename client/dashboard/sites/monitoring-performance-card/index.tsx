import { siteMetricsQuery } from '@automattic/api-queries';
import { LineChart, SeriesData } from '@automattic/charts';
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

function useSiteMetricsData( siteId: number, timeRange: number ) {
	// Memoize timestamps to prevent graph reloading on every render. Only refresh the data on time range change.
	const { start, end } = useMemo( () => convertTimeRangeToUnix( timeRange ), [ timeRange ] );

	const { data: requestsData, isPending: isLoadingRequestsData } = useQuery(
		siteMetricsQuery( siteId, { start, end, metric: 'requests_persec' } )
	);
	const { data: responseTimeData, isPending: isLoadingResponseTimeData } = useQuery(
		siteMetricsQuery( siteId, { start, end, metric: 'response_time_average' } )
	);

	// Function to get the dimension value for a specific key and period.
	const getDimensionValue = ( period: PeriodData ) => {
		if ( typeof period?.dimension === 'object' ) {
			return Object.values( period.dimension ).length > 0
				? Object.values( period.dimension )[ 0 ]
				: 0;
		}

		return null;
	};

	const formatPeriod = ( period ) => {
		return {
			date: new Date( period.timestamp * 1000 ),
			value: Math.round( getDimensionValue( period ) * 100 ) / 100,
		};
	};

	const formattedData = [
		requestsData?.data?.periods.map( formatPeriod ),
		responseTimeData?.data?.periods.map( formatPeriod ),
	];

	return {
		formattedData,
		isLoading: isLoadingRequestsData || isLoadingResponseTimeData,
	};
}

export default function MonitoringPerformanceCard( {
	site,
	timeRange,
}: {
	site: Site;
	timeRange: number;
} ) {
	const { formattedData, isLoading } = useSiteMetricsData( site.ID, timeRange );

	const data: SeriesData[] = [
		{
			label: __( 'Requests per minute' ),
			data: formattedData[ 0 ],
		},
		{
			label: __( 'Average response time (ms)' ),
			data: formattedData[ 1 ],
		},
	];

	return (
		<MonitoringCard
			title={ __( 'Server performance' ) }
			description={ __( 'Requests per minute and average server response time.' ) }
			onDownloadClick={ () => {} }
			onAnchorClick={ () => {} }
			isLoading={ isLoading }
		>
			<LineChart
				className="dashboard-monitoring-card__line-chart"
				data={ data }
				withGradientFill
				legendAlignmentVertical="top"
				legendOrientation="horizontal"
				legendShape="line"
				legendAlignmentHorizontal="left"
				height={ 300 }
				showLegend
				withLegendGlyph
			/>
		</MonitoringCard>
	);
}
