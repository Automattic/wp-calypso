import { siteMetricsQuery } from '@automattic/api-queries';
import { type DataPointDate, LineChart, SeriesData } from '@automattic/charts';
import { useQuery } from '@tanstack/react-query';
import {
	GlyphDiamond,
	GlyphStar,
	GlyphCross,
	GlyphTriangle,
	GlyphSquare,
	GlyphCircle,
} from '@visx/glyph';
import { useViewportMatch } from '@wordpress/compose';
import { useMemo, createElement } from 'react';
import { Text } from '../../components/text';
import {
	convertTimeRangeToUnix,
	chartColors,
	getLineChartTickNumber,
	getLineChartTickLabel,
} from '../monitoring/utils';
import MonitoringCard from '../monitoring-card';
import type { HTTPCodeSerie } from './http-codes';
import type { Site, SiteHostingMetrics } from '@automattic/api-core';

type SiteMetricsData = {
	responseStatusData: HttpStatusDataPoints | undefined;
	isLoading: boolean;
};

type HttpStatusDataPoints = {
	[ statusCode: string ]: DataPointDate[];
};

function useSiteMetricsData(
	siteId: number,
	timeRange: number,
	httpCodeSeries: HTTPCodeSerie[],
	allowedStatusCodes: number[]
): SiteMetricsData {
	// Memoize timestamps to prevent graph reloading on every render. Only refresh the data on time range change.
	const { start, end } = useMemo( () => convertTimeRangeToUnix( timeRange ), [ timeRange ] );

	const { data: responseStatusData, isPending: isLoading } = useQuery( {
		...siteMetricsQuery( siteId, {
			start,
			end,
			metric: 'requests_persec',
			dimension: 'http_status',
		} ),
		select: ( requestMethodsData: SiteHostingMetrics ): HttpStatusDataPoints => {
			if ( ! requestMethodsData?.data?.periods ) {
				return {};
			}

			const values: HttpStatusDataPoints = {};

			// Initialize values for each status code in the series that should be shown in the legend.
			httpCodeSeries.forEach( ( statusCode: HTTPCodeSerie ) => {
				if ( statusCode.showInLegend ) {
					values[ statusCode.statusCode ] = [];
				}
			} );

			// Iterate over periods.
			if ( requestMethodsData?.data?.periods ) {
				for ( const period of requestMethodsData.data.periods ) {
					if ( typeof period?.dimension !== 'object' ) {
						continue;
					}

					const date = new Date( period.timestamp * 1000 );

					allowedStatusCodes.forEach( ( statusCode ) => {
						const count = period.dimension.hasOwnProperty( statusCode )
							? period.dimension[ statusCode ]
							: 0;

						// If the status code is not in the values object, only add it if the count is greater than 0.
						if ( count > 0 && ! values.hasOwnProperty( statusCode ) ) {
							values[ statusCode ] = [];
						}

						values.hasOwnProperty( statusCode ) &&
							values[ statusCode ].push( {
								date,
								value: count > 0 ? Math.round( count * 60 * 100 ) / 100 : 0, // Convert to requests per minute and round to 2 decimals.
							} );
					} );
				}
			}

			return values;
		},
	} );

	return {
		responseStatusData,
		isLoading,
	};
}

const chartGlyphs = [
	GlyphCircle,
	GlyphCross,
	GlyphTriangle,
	GlyphSquare,
	GlyphDiamond,
	GlyphStar,
];

export default function MonitoringHttpResponsesCard( {
	site,
	timeRange,
	httpCodeSeries,
	cardLabel,
	cardDescription,
}: {
	site: Site;
	timeRange: number;
	httpCodeSeries: HTTPCodeSerie[];
	cardLabel: string;
	cardDescription: string;
} ) {
	const statusCodes = httpCodeSeries.map( ( { statusCode } ) => statusCode );

	const { responseStatusData, isLoading } = useSiteMetricsData(
		site.ID,
		timeRange,
		httpCodeSeries,
		statusCodes
	);

	const data: SeriesData[] = [];
	const codeStyles: { [ label: string ]: { color: string; glyph: React.ReactElement } } = {};
	let index = 0;

	if ( responseStatusData ) {
		httpCodeSeries.forEach( ( httpCodeSerie: HTTPCodeSerie ) => {
			if ( ! responseStatusData.hasOwnProperty( httpCodeSerie.statusCode ) ) {
				return;
			}

			if ( ! codeStyles.hasOwnProperty( httpCodeSerie.label ) ) {
				const color = chartColors[ index % chartColors.length ];
				codeStyles[ httpCodeSerie.label ] = {
					color,
					glyph: createElement( chartGlyphs[ index % chartGlyphs.length ], {
						size: 50,
						fill: color,
					} ),
				};
			}

			data.push( {
				label: httpCodeSerie.label,
				data: responseStatusData[ httpCodeSerie.statusCode ],
				options: {
					gradient: {
						from: codeStyles[ httpCodeSerie.label ].color,
						to: codeStyles[ httpCodeSerie.label ].color,
						fromOpacity: 0.2,
						toOpacity: 0,
					},
					stroke: codeStyles[ httpCodeSerie.label ].color,
					legendShapeStyle: {
						color: codeStyles[ httpCodeSerie.label ].color,
					},
				},
			} );

			++index;
		} );
	}

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

		return codeStyles.hasOwnProperty( key ) ? (
			codeStyles[ key ].glyph
		) : (
			<GlyphSquare size={ 50 } fill="#3858E9" />
		);
	};

	return (
		<MonitoringCard
			cardLabel="http-responses"
			title={ cardLabel }
			description={ cardDescription }
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
				curveType="monotone"
				glyphStyle={ {
					radius: 8,
				} }
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
				legendPosition="top"
			/>
		</MonitoringCard>
	);
}
