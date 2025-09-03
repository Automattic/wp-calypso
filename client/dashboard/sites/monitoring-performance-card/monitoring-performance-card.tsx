import { __ } from '@wordpress/i18n';
import {
	MetricsType,
	PeriodData,
	useSiteMetricsQuery,
} from '../../../sites/monitoring/hooks/use-metrics-query';
import MonitoringCard from '../monitoring-card';
import { MonitoringLineChart } from '../monitoring-card-line-chart';
import { FirstChartTooltipWithSeriesHandler } from '../monitoring-card-line-chart/line-chart-tooltip';
import { timeHighlightPlugin } from '../monitoring-card-line-chart/time-highlight-plugin';
import {
	roundToTwoDecimals,
	seriesInfo,
	tooltipsPlugin,
} from '../monitoring-card-line-chart/uplot-tooltip-plugin';
import type { Site } from '@automattic/api-core';

type TimeRange = {
	start: number;
	end: number;
};

function convertTimeRangeToUnix( timeRange: number ) {
	const start = Math.floor( new Date().getTime() / 1000 ) - timeRange * 3600;
	const end = Math.floor( new Date().getTime() / 1000 );

	return { start, end };
}

export function useSiteMetricsData( siteId: number, timeRange: TimeRange, metric?: MetricsType ) {
	// Use the custom hook for time range selection
	const { start, end } = timeRange;

	const { data: requestsData, isLoading } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: metric || 'requests_persec',
	} );

	const { data: responseTimeData } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: metric || 'response_time_average',
	} );

	// Function to get the dimension value for a specific key and period
	const getDimensionValue = ( period: PeriodData ) => {
		if ( typeof period?.dimension === 'object' && Object.keys( period.dimension ).length === 0 ) {
			// If the dimension is an empty object, return 0
			return 0;
		} else if ( typeof period?.dimension === 'object' ) {
			// If the dimension is an object, try to find and return the dimension value
			const firstKey = Object.keys( period.dimension )[ 0 ];
			return firstKey ? period.dimension[ firstKey ] : null;
		}

		return null;
	};

	// Process the data in the format accepted by uPlot
	const formattedData =
		requestsData?.data?.periods?.reduce(
			( acc, period, index ) => {
				const timestamp = period.timestamp;

				// Check if the timestamp is already in the arrays, if not, push it
				if ( acc[ 0 ][ acc[ 0 ].length - 1 ] !== timestamp ) {
					acc[ 0 ].push( timestamp );

					const requestsPerSecondValue = getDimensionValue( period );
					if ( requestsPerSecondValue !== null ) {
						const requestsPerMinuteValue = requestsPerSecondValue * 60; // Convert to requests per minute
						acc[ 1 ].push( requestsPerMinuteValue ); // Push RPM value into the array
					}
					// Add response time data as a green line
					if ( responseTimeData?.data?.periods && responseTimeData.data.periods[ index ] ) {
						const responseTimeAverageValue = getDimensionValue(
							responseTimeData.data.periods[ index ]
						);
						if ( responseTimeAverageValue !== null ) {
							acc[ 2 ].push( responseTimeAverageValue * 1000 ); // Convert to response time average in milliseconds
						}
					}
				}

				return acc;
			},
			[ [], [], [] ] as Array< Array< number | null > > // Adjust the initial value with placeholders for both lines
		) || ( [ [], [], [] ] as Array< Array< number | null > > ); // Return default value when data is not available yet

	return {
		formattedData,
		isLoading,
	};
}

export default function MonitoringPerformanceCard( {
	site,
	timeRange,
}: {
	site: Site;
	timeRange: number;
} ) {
	const { formattedData, isLoading: isLoadingLineChart } = useSiteMetricsData(
		site.ID,
		convertTimeRangeToUnix( timeRange )
	);

	const tooltipSeriesCallback = ( i: number, value: number ): seriesInfo | null => {
		if ( i === 0 ) {
			return null;
		}
		--i;

		const labelData: seriesInfo[] = [
			{
				color: '#3858e9',
				label: __( 'Requests per minute' ),
			},
			{
				color: '#5BA300',
				label: __( 'Average response time (ms)' ),
			},
		];

		if ( labelData.length >= i ) {
			return {
				color: labelData[ i ].color,
				label: labelData[ i ].label,
				value: roundToTwoDecimals( value ),
			};
		}

		return null;
	};

	return (
		<MonitoringCard
			title={ __( 'Server performance' ) }
			heading={ __( 'Requests' ) }
			description={ __( 'Requests per minute and average server response time.' ) }
			bottom={
				<MonitoringLineChart
					timeRange={ timeRange }
					title={ __( 'Server performance' ) }
					subtitle={ __( 'Requests per minute and average server response time' ) }
					data={ formattedData as uPlot.AlignedData }
					series={ [
						{
							fill: '#3858e9',
							label: __( 'Requests per minute' ),
							stroke: '#3858e9',
							showInLegend: true,
							showInTooltip: true,
						},
						{
							fill: '#5BA300',
							label: __( 'Average response time (ms)' ),
							stroke: '#5BA300',
							scale: 'average-response-time',
							unit: 'ms',
							showInLegend: true,
							showInTooltip: true,
						},
					] }
					isLoading={ isLoadingLineChart }
					options={ {
						plugins: [
							timeHighlightPlugin( 'auto' ),
							tooltipsPlugin( FirstChartTooltipWithSeriesHandler( tooltipSeriesCallback ), {
								position: 'followCursor',
							} ),
						],
					} }
				></MonitoringLineChart>
			}
		/>
	);
}
