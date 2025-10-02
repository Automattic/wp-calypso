import { siteMetricsQuery } from '@automattic/api-queries';
import { DataPointPercentage, PieChart, Legend } from '@automattic/charts';
import { useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { convertTimeRangeToUnix, chartColors } from '../monitoring/utils';
import MonitoringCard from '../monitoring-card';
import type { LegendData } from '../monitoring/types';
import type { Site, SiteHostingMetrics } from '@automattic/api-core';

type SiteRequestMethodsData = {
	data: DataPointPercentage[];
	isLoading: boolean;
};

function useSiteRequestMethodsData( siteId: number, timeRange: number ): SiteRequestMethodsData {
	const { start, end } = useMemo( () => convertTimeRangeToUnix( timeRange ), [ timeRange ] );

	const { data: requestMethodsData, isPending: isLoading } = useQuery( {
		...siteMetricsQuery( siteId, {
			start,
			end,
			metric: 'requests_persec',
			dimension: 'http_verb',
		} ),
		select: ( requestMethodsData: SiteHostingMetrics ): DataPointPercentage[] => {
			if ( ! requestMethodsData?.data?.periods ) {
				return [];
			}

			const methodsMap = requestMethodsData.data.periods.reduce< Record< string, number > >(
				( acc, period ) => {
					if ( typeof period?.dimension === 'object' ) {
						for ( const [ method, value ] of Object.entries( period.dimension ) ) {
							acc[ method ] = ( acc[ method ] ?? 0 ) + value;
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
						label: method.toUpperCase(),
						value: value,
						percentage: valuePercentage,
						valueDisplay: ( Math.round( valuePercentage * 10 ) / 100 ).toString() + '%',
						color: chartColors[ index % chartColors.length ],
					};
				}
			);
		},
	} );

	return {
		data: requestMethodsData || [],
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
			isLoading={ isLoading }
			className="dashboard-monitoring-card--row-layout"
		>
			<Legend
				chartId="request-methods-chart"
				items={ mapDataForLegend( data ) }
				className="dashboard-monitoring-card--legend"
			/>
			<HStack alignment="center">
				<PieChart
					chartId="request-methods-chart"
					thickness={ 0.3 }
					gapScale={ 0.02 }
					size={ 300 }
					data={ data }
					showLabels={ false }
					withTooltips
				/>
			</HStack>
		</MonitoringCard>
	);
}
