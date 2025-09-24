import { siteMetricsQuery } from '@automattic/api-queries';
import { LineChart, SeriesData } from '@automattic/charts';
import { useQuery } from '@tanstack/react-query';
import { useViewportMatch } from '@wordpress/compose';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Text } from '../../components/text';
import MonitoringCard from '../monitoring-card';
import type { SiteMetricsData, PeriodData, TimeRange } from '../monitoring/types';
import type { Site } from '@automattic/api-core';
import type { DataPointDate } from '@automattic/charts/dist/types/types';

function convertTimeRangeToUnix( timeRange: number ): TimeRange {
	const start = Math.floor( new Date().getTime() / 1000 ) - timeRange * 3600;
	const end = Math.floor( new Date().getTime() / 1000 );

	return { start, end };
}

type SiteMetricsData = {
	responseStatusData: DataPointDate[] | undefined;
	isLoading: boolean;
};

function useSiteMetricsData( siteId: number, timeRange: number ): SiteMetricsData {
	// Memoize timestamps to prevent graph reloading on every render. Only refresh the data on time range change.
	const { start, end } = useMemo( () => convertTimeRangeToUnix( timeRange ), [ timeRange ] );

	const { data: responseStatusData, isPending: isLoading } = useQuery(
		siteMetricsQuery( siteId, { start, end, metric: 'requests_persec', dimension: 'http_status' } )
	);

	// Function to get the dimension value for a specific key and period.
	const getDimensionValue = ( period: PeriodData ) => {
		if ( typeof period?.dimension === 'object' ) {
			return null; /*Object.values( period.dimension ).length > 0
				? { Object.keys( period.dimension )[ 0 ]: Object.values( period.dimension )[ 0 ] }
				: ;*/
		}

		return null;
	};

	const filterRequestsDataPeriod = ( period: PeriodData ) => {
		const value = getDimensionValue( period );
		//return value.statusCode
	};

	const formatResponseStatusDataPeriod = ( periods: PeriodData[] ) => {
		if ( ! periods || periods.length === 0 ) {
			return {};
		}

		const values = {};

		// Iterate over periods.
		for ( const period of periods ) {
			if ( typeof period?.dimension === 'object' ) {
				const date = new Date( period.timestamp * 1000 );

				for ( const [ statusCode, count ] of Object.entries( period.dimension ) ) {
					// Only include 200, 301, 302.
					if ( ! [ 200, 301, 302 ].includes( parseInt( statusCode ) ) ) {
						continue;
					}

					if ( ! values.hasOwnProperty( statusCode ) ) {
						values[ statusCode ] = [];
					}

					values[ statusCode ].push( {
						date,
						value: count === null ? 0 : Math.round( count * 60 * 100 ) / 100, // Convert to requests per minute and round to 2 decimals.
					} );
				}
			}
		}

		return values;
	};

	return {
		responseStatusData: formatResponseStatusDataPeriod( responseStatusData?.data?.periods ),
		isLoading,
	};
}

const chartColors = [ '#3858E9', '#5BA300', '#F57600', '#B51963' ];

export default function MonitoringHttpResponsesCard( {
	site,
	timeRange,
	requestType,
}: {
	site: Site;
	timeRange: number;
	requestType: 'successful' | 'failed';
} ) {
	const { responseStatusData, isLoading } = useSiteMetricsData( site.ID, timeRange );

	console.log( responseStatusData );

	const data: SeriesData[] = [];
	let index = 0;

	for ( const [ statusCode, values ] of Object.entries( responseStatusData || {} ) ) {
		const color = chartColors[ index % chartColors.length ];

		data.push( {
			label: statusCode,
			data: values || [],
			options: {
				gradient: {
					from: color,
					to: color,
					fromOpacity: 0.2,
					toOpacity: 0,
				},
				stroke: color,
				legendShapeStyle: {
					color: color,
				},
			},
		} );

		++index;
	}

	const lessThanMediumViewport = useViewportMatch( 'medium', '<' );

	let numTicks: undefined | number;
	switch ( timeRange ) {
		case 168:
			numTicks = lessThanMediumViewport ? 3 : 7;
			break;
		case 72:
			numTicks = lessThanMediumViewport ? 3 : 6;
			break;
		case 24:
		case 6:
			numTicks = lessThanMediumViewport ? 4 : 12;
			break;
	}

	const xAxisOptions = {
		tickFormat: ( date: string ) => {
			const d = new Date( date );

			if ( timeRange <= 24 ) {
				return `${ d.getHours() }:${ d.getMinutes().toString().padStart( 2, '0' ) }`;
			}

			if ( timeRange > 72 || ( timeRange > 24 && lessThanMediumViewport ) ) {
				return `${ d.toLocaleDateString() }`;
			}

			return `${ d.toLocaleDateString() } ${ d.getHours() }:${ d
				.getMinutes()
				.toString()
				.padStart( 2, '0' ) }`;
		},
		numTicks: numTicks,
	};

	const getLegendIcon = ( key: string, isTooltip = false ) => {
		const isLegendGlyph = key.startsWith( 'legend-glyph-' );
		if ( isLegendGlyph ) {
			key = key.replace( 'legend-glyph-', '' );
		}

		switch ( key ) {
			case 'Requests per minute':
				return (
					<rect
						width="6"
						height="6"
						transform={ ( isTooltip ? 'translate(4, 0) ' : 'translate(3, -1) ' ) + 'rotate(45)' }
						fill="#3858E9"
					/>
				);
			case 'Average response time (ms)':
				return (
					<circle
						cx={ isLegendGlyph || isTooltip ? 4 : 0 }
						cy={ isLegendGlyph || isTooltip ? 4 : 0 }
						r="4"
						fill="#5BA300"
						strokeWidth="1.5"
					/>
				);
		}

		return null;
	};

	const cardLabel =
		requestType === 'successful'
			? __( 'Successful HTTP responses' )
			: __( 'Unsuccessful HTTP responses' );
	const cardDescription =
		requestType === 'successful'
			? __( 'Requests per minute completed without errors by the server.' )
			: __( 'Requests per minute that encountered errors or issues during processing.' );

	return (
		<MonitoringCard
			cardLabel="server-performance"
			title={ cardLabel }
			description={ cardDescription }
			onDownloadClick={ () => {} }
			onAnchorClick={ () => {} }
			isLoading={ isLoading }
		>
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
						'en-US',
						{
							weekday: 'short',
							year: 'numeric',
							month: 'short',
							day: 'numeric',
						}
					);
					const timeStr = tooltipProps.tooltipData.nearestDatum.datum.date.toLocaleTimeString(
						'en-US',
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
											<svg width="8" height="8">
												{ getLegendIcon( series.key, true ) }
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
		</MonitoringCard>
	);
}
