import { siteMetricsQuery } from '@automattic/api-queries';
import { DataPointPercentage, PieChart, Legend } from '@automattic/charts';
import { useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import MonitoringCard from '../monitoring-card';
import type { LegendData, TimeRange } from '../monitoring/types';
import type { Site, SiteHostingMetrics } from '@automattic/api-core';

function convertTimeRangeToUnix( timeRange: number ): TimeRange {
	const start = Math.floor( new Date().getTime() / 1000 ) - timeRange * 3600;
	const end = Math.floor( new Date().getTime() / 1000 );

	return { start, end };
}

type ResponseTypesData = {
	data: DataPointPercentage[];
	isLoading: boolean;
};

const chartColors = [ '#3858E9', '#5BA300', '#F57600', '#B51963' ];

function useResponseTypesData( siteId: number, timeRange: number ): ResponseTypesData {
	const { start, end } = useMemo( () => convertTimeRangeToUnix( timeRange ), [ timeRange ] );

	const { data: responseTypesData, isPending: isLoading } = useQuery( {
		...siteMetricsQuery( siteId, {
			start,
			end,
			metric: 'requests_persec',
			dimension: 'page_renderer',
		} ),
		select: ( responseTypesData: SiteHostingMetrics ): DataPointPercentage[] => {
			if ( ! responseTypesData?.data?.periods ) {
				return [];
			}

			const methodsMap = responseTypesData.data.periods.reduce< Record< string, number > >(
				( acc, period ) => {
					if ( typeof period?.dimension === 'object' ) {
						for ( const [ method, value ] of Object.entries( period.dimension ) ) {
							const methodLabel = method || 'php'; // Empty method means PHP (dynamic).
							acc[ methodLabel ] = ( acc[ methodLabel ] ?? 0 ) + value;
						}
					}
					return acc;
				},
				{}
			);

			const sum: number = Object.values( methodsMap ).reduce(
				( acc: number, curr: number ): number => acc + curr,
				0
			);

			return Object.entries( methodsMap ).map(
				( [ method, value ]: [ string, number ], index ): DataPointPercentage => {
					const valuePercentage = Math.round( ( value * 100 ) / sum );

					return {
						label:
							method === 'php' ? 'Dynamic' : method.slice( 0, 1 ).toUpperCase() + method.slice( 1 ),
						value: Math.round( value * 100 ) / 100,
						percentage: valuePercentage,
						valueDisplay: valuePercentage.toString() + '%',
						color: chartColors[ index % chartColors.length ],
					};
				}
			);
		},
	} );

	return {
		data: responseTypesData || [],
		isLoading,
	};
}

function mapDataForLegend( data: DataPointPercentage[] ): LegendData[] {
	return data.map( ( value ) => ( {
		label: value.label,
		value: value?.valueDisplay || '',
		color: value?.color || '',
	} ) );
}

export default function MonitoringResponseTypesCard( {
	site,
	timeRange,
}: {
	site: Site;
	timeRange: number;
} ) {
	const { data, isLoading } = useResponseTypesData( site.ID, timeRange );

	return (
		<MonitoringCard
			title={ __( 'Response types' ) }
			description={ __( 'Percentage of dynamic versus static responses.' ) }
			onDownloadClick={ () => {} }
			onAnchorClick={ () => {} }
			isLoading={ isLoading }
			className="dashboard-monitoring-card--row-layout"
		>
			<Legend chartId="response-types-chart" items={ mapDataForLegend( data ) } />
			<HStack alignment="center">
				<PieChart
					chartId="response-types-chart"
					thickness={ 0.3 }
					gapScale={ 0.02 }
					size={ 300 }
					data={ data }
				/>
			</HStack>
		</MonitoringCard>
	);
}
