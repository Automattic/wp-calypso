import { siteMetricsQuery } from '@automattic/api-queries';
import { DataPointPercentage, PieChart, Legend } from '@automattic/charts';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { convertTimeRangeToUnix, chartColors } from '../monitoring/utils';
import MonitoringCard from '../monitoring-card';
import type { LegendData } from '../monitoring/types';
import type { Site, SiteHostingMetrics } from '@automattic/api-core';

type ResponseTypesData = {
	data: DataPointPercentage[];
	isLoading: boolean;
};

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
					const valuePercentage = ( value * 100 ) / sum;

					return {
						label:
							method === 'php' ? 'Dynamic' : method.slice( 0, 1 ).toUpperCase() + method.slice( 1 ),
						value: value,
						percentage: valuePercentage,
						valueDisplay: ( Math.round( valuePercentage * 10 ) / 10 ).toString() + '%',
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
			<VStack justify="space-between" expanded>
				<Legend chartId="response-types-chart" items={ mapDataForLegend( data ) } />
				<HStack alignment="center">
					<PieChart
						chartId="response-types-chart"
						thickness={ 0.3 }
						gapScale={ 0.02 }
						size={ 300 }
						data={ data }
						showLabels={ false }
					/>
				</HStack>
			</VStack>
		</MonitoringCard>
	);
}
