import { siteMetricsQuery } from '@automattic/api-queries';
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

	// Process the data in the format accepted by uPlot
	const formattedData =
		requestsData?.data?.periods?.reduce(
			( acc, period, index ) => {
				// Check if the timestamp is already in the arrays, if not, push it
				if ( acc[ 0 ][ acc[ 0 ].length - 1 ] !== period.timestamp ) {
					acc[ 0 ].push( period.timestamp );

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

	return (
		<MonitoringCard
			title={ __( 'Server performance' ) }
			description={ __( 'Requests per minute and average server response time.' ) }
			onDownloadClick={ () => {} }
			onAnchorClick={ () => {} }
			isLoading={ isLoading }
		>
			<pre>{ JSON.stringify( formattedData, null, 2 ) }</pre>
		</MonitoringCard>
	);
}
