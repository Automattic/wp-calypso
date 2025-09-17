import { siteMetricsQuery } from '@automattic/api-queries';
import { LineChart, SeriesData } from '@automattic/charts';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import MonitoringCard from '../monitoring-card';
import type { PeriodData, TimeRange } from '../monitoring/types';
import type { Site } from '@automattic/api-core';
import type { DataPointDate } from '@automattic/charts/dist/types/types';

function convertTimeRangeToUnix( timeRange: number ): TimeRange {
	const start = Math.floor( new Date().getTime() / 1000 ) - timeRange * 3600;
	const end = Math.floor( new Date().getTime() / 1000 );

	return { start, end };
}

type SiteMetricsData = {
	requestsData: DataPointDate[] | undefined;
	responseTimeData: DataPointDate[] | undefined;
	isLoading: boolean;
};

function useSiteMetricsData( siteId: number, timeRange: number ): SiteMetricsData {
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

	const formatRequestsDataPeriod = ( period: PeriodData ) => {
		const value = getDimensionValue( period );
		return {
			date: new Date( period.timestamp * 1000 ),
			value: value === null ? 0 : Math.round( value * 60 * 100 ) / 100, // Convert to requests per minute and round to 2 decimals.
		};
	};

	const formatResponseTimeDataPeriod = ( period: PeriodData ) => {
		const value = getDimensionValue( period );
		return {
			date: new Date( period.timestamp * 1000 ),
			value: value === null ? 0 : Math.round( value * 100 ) / 100,
		};
	};

	return {
		requestsData: requestsData?.data?.periods.map( formatRequestsDataPeriod ),
		responseTimeData: responseTimeData?.data?.periods.map( formatResponseTimeDataPeriod ),
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
	const { requestsData, responseTimeData, isLoading } = useSiteMetricsData( site.ID, timeRange );

	const data: SeriesData[] = [
		{
			label: __( 'Requests per minute' ),
			data: requestsData || [],
		},
		{
			label: __( 'Average response time (ms)' ),
			data: responseTimeData || [],
		},
	];

	const xAxisOptions = {
		tickFormat: ( date: string ) => {
			const d = new Date( date );

			if ( timeRange <= 24 ) {
				return `${ d.getHours() }:${ d.getMinutes().toString().padStart( 2, '0' ) }`;
			}

			if ( timeRange > 72 ) {
				return `${ d.toLocaleDateString() }`;
			}

			return `${ d.toLocaleDateString() } ${ d.getHours() }:${ d
				.getMinutes()
				.toString()
				.padStart( 2, '0' ) }`;
		},
	};

	if ( timeRange > 72 ) {
		xAxisOptions.numTicks = timeRange / 24;
	} else if ( timeRange > 24 ) {
		xAxisOptions.numTicks = timeRange / 12;
	}

	return (
		<MonitoringCard
			cardLabel="server-performance"
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
				height={ 450 }
				maxWidth={ 1400 }
				showLegend
				withLegendGlyph
				options={ {
					axis: {
						x: xAxisOptions,
					},
				} }
			/>
		</MonitoringCard>
	);
}
