import { siteMetricsQuery } from '@automattic/api-queries';
import { type DataPointDate, LineChart, SeriesData } from '@automattic/charts';
import { useQuery } from '@tanstack/react-query';
import { GlyphDiamond, GlyphCircle } from '@visx/glyph';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { Text } from '../../components/text';
import {
	convertTimeRangeToUnix,
	getLineChartTickNumber,
	getLineChartTickLabel,
} from '../monitoring/utils';
import MonitoringCard from '../monitoring-card';
import type { PeriodData } from '../monitoring/types';
import type { Site } from '@automattic/api-core';

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
	const locale = useLocale();

	const requestsPerMinuteLabel = __( 'Requests per minute' );
	const averageResponseTimeLabel = __( 'Average response time (ms)' );

	const data: SeriesData[] = [
		{
			label: requestsPerMinuteLabel,
			data: requestsData || [],
			options: {
				gradient: {
					from: '#3858E9',
					to: '#3858E9',
					fromOpacity: 0.2,
					toOpacity: 0,
				},
				stroke: '#3858E9',
				legendShapeStyle: {
					color: '#3858E9',
				},
			},
		},
		{
			label: averageResponseTimeLabel,
			data: responseTimeData || [],
			options: {
				gradient: {
					from: '#5BA300',
					to: '#5BA300',
					fromOpacity: 0.2,
					toOpacity: 0,
				},
				stroke: '#5BA300',
				legendShapeStyle: {
					color: '#5BA300',
				},
			},
		},
	];

	const lessThanMediumViewport = useViewportMatch( 'medium', '<' );
	const xAxisOptions = {
		tickFormat: ( date: string ) =>
			getLineChartTickLabel( date, timeRange, lessThanMediumViewport ),
		numTicks: getLineChartTickNumber( timeRange, lessThanMediumViewport ),
	};

	const getLegendIcon = ( key: string ) => {
		const isLegendGlyph = key.startsWith( 'legend-glyph-' );
		if ( isLegendGlyph ) {
			key = key.replace( 'legend-glyph-', '' );
		}

		switch ( key ) {
			case requestsPerMinuteLabel:
				return <GlyphDiamond size={ 50 } fill="#3858E9" />;
			case averageResponseTimeLabel:
				return <GlyphCircle size={ 50 } fill="#5BA300" />;
		}

		return null;
	};

	return (
		<MonitoringCard
			cardLabel="server-performance"
			title={ __( 'Server performance' ) }
			description={ __( 'Requests per minute and average server response time.' ) }
			isLoading={ isLoading }
		>
			{ isLoading || requestsData || responseTimeData ? (
				<LineChart
					className="dashboard-monitoring-card__line-chart"
					data={ data }
					withGradientFill
					height={ 450 }
					maxWidth={ 1400 }
					showLegend
					withLegendGlyph
					renderGlyph={ ( glyphProps ) => getLegendIcon( glyphProps.key ) }
					renderTooltip={ ( tooltipProps ) => {
						if ( ! tooltipProps?.tooltipData?.nearestDatum?.datum?.date ) {
							return null;
						}

						const dateStr = tooltipProps.tooltipData.nearestDatum.datum.date.toLocaleDateString(
							locale,
							{
								weekday: 'short',
								year: 'numeric',
								month: 'short',
								day: 'numeric',
							}
						);
						const timeStr = tooltipProps.tooltipData.nearestDatum.datum.date.toLocaleTimeString(
							locale,
							{
								hour12: false,
								timeZoneName: 'short',
							}
						);
						return (
							<div className="dashboard-monitoring-card__line-chart--tooltip">
								<Text isBlock weight="bold" size="larger">
									{ dateStr }
								</Text>
								<Text weight="normal">{ timeStr }</Text>

								<div className="dashboard-monitoring-card__line-chart--tooltip-lines">
									{ Object.values( tooltipProps.tooltipData.datumByKey ).map( ( series ) => (
										<div
											key={ 'tooltip-line-' + series.key }
											className="dashboard-monitoring-card__line-chart--tooltip-lines--line"
										>
											<Text weight="normal">
												<svg width="5" height="5">
													{ getLegendIcon( series.key ) }
												</svg>
												{ series.key }
											</Text>
											<Text weight="normal">{ series.datum.value }</Text>
										</div>
									) ) }
								</div>
							</div>
						);
					} }
					options={ {
						axis: {
							x: xAxisOptions,
						},
					} }
				/>
			) : (
				<VStack alignment="center">
					<Text>{ __( 'No data available for this site.' ) }</Text>
				</VStack>
			) }
		</MonitoringCard>
	);
}
