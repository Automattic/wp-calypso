import { siteMetricsQuery } from '@automattic/api-queries';
import { DataPointPercentage, PieChart, Legend } from '@automattic/charts';
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
		siteMetricsQuery( siteId, {
			start,
			end,
			metric: 'requests_persec',
			dimension: 'page_renderer',
		} )
	);

	const formatData = ( requestMethodsData ): DataPointPercentage[] => {
		if ( ! requestMethodsData?.data?.periods ) {
			return [];
		}

		const methodsMap = {};

		requestMethodsData.data.periods.forEach( ( period: PeriodData ) => {
			if ( typeof period?.dimension === 'object' ) {
				Object.entries( period.dimension ).forEach( ( [ method, value ] ) => {
					if ( ! method ) {
						// Empty method means PHP (dynamic).
						method = 'php';
					}

					if ( ! methodsMap[ method ] ) {
						methodsMap[ method ] = 0;
					}
					methodsMap[ method ] += value;
				} );
			}
		} );

		const sum = Object.values( methodsMap ).reduce( ( acc, curr ) => acc + curr, 0 );

		return Object.entries( methodsMap )
			.map( ( [ method, value ] ) => ( {
				label:
					method === 'php' ? 'Dynamic' : method.slice( 0, 1 ).toUpperCase() + method.slice( 1 ),
				value: Math.round( value * 100 ) / 100,
				percentage: Math.round( ( value * 100 ) / sum ),
				color: method === 'php' ? '#3858E9' : '#5BA300',
			} ) )
			.filter( ( item ) => item.percentage > 0 );
	};

	return {
		data: formatData( requestMethodsData ),
		isLoading,
	};
}

function mapDataForLegend( item: DataPointPercentage ) {
	return {
		label: item.label,
		value: item.percentage + '%',
		color: item.color,
	};
}

export default function MonitoringResponseTypesCard( {
	site,
	timeRange,
}: {
	site: Site;
	timeRange: number;
} ) {
	const { data, isLoading } = useSiteRequestMethodsData( site.ID, timeRange );

	return (
		<MonitoringCard
			title={ __( 'Response types' ) }
			description={ __( 'Percentage of dynamic versus static responses.' ) }
			onDownloadClick={ () => {} }
			onAnchorClick={ () => {} }
			isLoading={ isLoading }
			className="dashboard-monitoring-card--row-layout"
		>
			<Legend chartId="response-types-chart" items={ data.map( mapDataForLegend ) } />
			<PieChart
				chartId="response-types-chart"
				thickness={ 0.3 }
				gapScale={ 0.02 }
				className="dashboard-monitoring-card__donut-chart"
				data={ data }
				legendAlignmentVertical="top"
				legendOrientation="horizontal"
				legendAlignmentHorizontal="left"
			/>
		</MonitoringCard>
	);
}
