import { LineChart } from '@automattic/charts';
import { GlyphCircle, GlyphSquare, GlyphTriangle } from '@visx/glyph';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '../../components/notice';
import { Text } from '../../components/text';
import {
	Valuation,
	getColorForStatus,
	getDisplayUnit,
	getFormattedNumber,
	getFormattedValue,
	getStatusText,
	mapThresholdsToStatus,
} from '../../utils/site-performance';
import type { SitePerformanceReport, SitePerformanceHistory, Metrics } from '@automattic/api-core';
import '@automattic/charts/line-chart/style.css';

const WEEK_TO_SHOW = 8;

const StatusGlyph = {
	good: GlyphCircle,
	needsImprovement: GlyphTriangle,
	bad: GlyphSquare,
};

const StatusIndicator = ( { valuation }: { valuation: Valuation } ) => {
	const innerSvg: Record< Valuation, React.ReactNode > = {
		good: <rect x="1" y="1" width="10" height="10" rx="5" />,
		needsImprovement: (
			<path d="M5.56292 0.786741C5.75342 0.443836 6.24658 0.443837 6.43708 0.786742L11.5873 10.0572C11.7725 10.3904 11.5315 10.8 11.1502 10.8H0.849757C0.468515 10.8 0.227531 10.3904 0.412679 10.0572L5.56292 0.786741Z" />
		),
		bad: <rect x="1" y="1" width="10" height="10" rx="2" />,
	};

	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 12 12"
			fill={ getColorForStatus( valuation ) }
			xmlns="http://www.w3.org/2000/svg"
		>
			{ innerSvg[ valuation ] }
		</svg>
	);
};

const MetricLabel = ( {
	indicator,
	label,
	value,
}: {
	indicator: Valuation;
	label: string;
	value: string;
} ) => {
	return (
		<HStack justify="flex-start" alignment="center" expanded={ false }>
			<StatusIndicator valuation={ indicator } />
			<Text size="small">{ label }</Text>
			<Text>{ value }</Text>
		</HStack>
	);
};

const useLineChartData = ( metric: Metrics, history?: SitePerformanceHistory ) => {
	const dates = history?.collection_period ?? [];
	const values = history?.metrics[ metric ] ?? [];
	if ( ! dates.length || ! values.length ) {
		return null;
	}

	const seriesData: Array< {
		label: string;
		data: Array< { date: Date; value: number } >;
		options: { stroke: string };
	} > = [];
	const allData = [];
	let currentValuation;

	const dataValues = [];
	// Start from the most recent data and go backwards until we have enough data points or reach the start of available data.
	for ( let i = dates.length - 1; i >= 0; i-- ) {
		if ( values[ i ] !== null && values[ i ] !== undefined ) {
			dataValues.push( { date: dates[ i ], value: values[ i ] } );
			if ( dataValues.length >= WEEK_TO_SHOW ) {
				break;
			}
		}
	}

	// Loop through the date range
	for ( const { date, value } of dataValues ) {
		const formattedDate =
			typeof date === 'string'
				? date
				: [
						date.year,
						date.month.toString().padStart( 2, '0' ),
						date.day.toString().padStart( 2, '0' ),
				  ].join( '-' );

		const nextValuation = mapThresholdsToStatus( metric, value );
		if ( nextValuation !== currentValuation ) {
			const lastData = seriesData[ seriesData.length - 1 ]?.data?.slice().pop();
			currentValuation = nextValuation;
			seriesData.push( {
				// The label should be unique.
				label: `${ getStatusText( currentValuation ) } - ${ seriesData.length }`,
				data: ( lastData ? [ lastData ] : [] ) as Array< { date: Date; value: number } >,
				options: {
					stroke: getColorForStatus( currentValuation ),
				},
			} );
		}

		const data = {
			date: new Date( formattedDate ),
			value: getFormattedValue( metric, value ),
		};
		seriesData[ seriesData.length - 1 ].data.push( data );
		allData.push( data );
	}

	const maxY = Math.max( ...allData.map( ( d ) => d.value ) );

	return {
		seriesData: [
			// Use all data to maintain the range of the x axis.
			{
				label: '',
				data: allData,
			},
			...seriesData,
		],
		yScale: {
			domain: [ 0, maxY === 0 ? 1 : maxY * 1.5 ] as [ number, number ],
		},
	};
};

export default function CoreMetricsChart( {
	report,
	metric,
	metricsThresholds,
}: {
	history?: SitePerformanceHistory;
	report: SitePerformanceReport;
	metric: Metrics;
	metricsThresholds: Record< Metrics, { good: number; needsImprovement: number; bad: number } >;
} ) {
	const { good, needsImprovement, bad } = metricsThresholds[ metric ];
	const isDesktop = useViewportMatch( 'medium' );
	const lineChartData = useLineChartData( metric, report.history );

	const formatThresholdValue = ( isOverall: boolean, valuation: Valuation ) => {
		const unit = getDisplayUnit( metric );
		if ( valuation === 'good' ) {
			return isOverall
				? sprintf( '(90–%(to)s)', { to: getFormattedValue( metric, good ) } )
				: sprintf( '(0–%(to)s%(unit)s)', {
						to: getFormattedValue( metric, good ),
						unit,
				  } );
		}

		if ( valuation === 'needsImprovement' ) {
			return isOverall
				? sprintf( '(50–%(to)s)', { to: getFormattedValue( metric, needsImprovement ) } )
				: sprintf( '(%(from)s–%(to)s%(unit)s)', {
						from: getFormattedValue( metric, good ),
						to: getFormattedValue( metric, needsImprovement ),
						unit,
				  } );
		}

		if ( valuation === 'bad' ) {
			return isOverall
				? sprintf( '(0-%(to)s)', { to: getFormattedValue( metric, bad ) } )
				: sprintf( '(Over %(from)s%(unit)s)', {
						from: getFormattedValue( metric, needsImprovement ),
						unit,
				  } );
		}

		return '';
	};

	const isOverall = metric === 'overall_score';

	return (
		<>
			<HStack spacing={ isDesktop ? 5 : 2 } justify="flex-start" wrap>
				<MetricLabel
					indicator="good"
					label={ __( 'Excellent' ) }
					value={ formatThresholdValue( isOverall, 'good' ) }
				/>
				<MetricLabel
					indicator="needsImprovement"
					label={ __( 'Needs Improvement' ) }
					value={ formatThresholdValue( isOverall, 'needsImprovement' ) }
				/>
				<MetricLabel
					indicator="bad"
					label={ __( 'Poor' ) }
					value={ formatThresholdValue( isOverall, 'bad' ) }
				/>
			</HStack>
			{ lineChartData ? (
				<LineChart
					height={ 300 }
					data={ lineChartData.seriesData }
					withGradientFill={ false }
					curveType="linear"
					options={ {
						yScale: lineChartData.yScale,
						axis: {
							y: {
								tickFormat: ( value ) => `${ getFormattedNumber( value ) }`,
							},
						},
					} }
					renderGlyph={ ( { key, x, y, datum } ) => {
						const data = datum as { value: number };
						const value = [ 'lcp', 'fcp', 'ttfb', 'inp', 'tbt' ].includes( metric )
							? data.value * 1000
							: data.value;
						const valuation = mapThresholdsToStatus( metric, value );
						const color = getColorForStatus( valuation );
						const label = getStatusText( valuation );
						if ( ! label.includes( key ) ) {
							return null;
						}
						const GlyphComponent = StatusGlyph[ valuation ];
						return <GlyphComponent top={ y } left={ x } size={ 100 } fill={ color } />;
					} }
					renderTooltip={ ( { tooltipData } ) => {
						const nearestDatum = tooltipData?.nearestDatum?.datum;
						if ( ! nearestDatum ) {
							return null;
						}

						const formattedDate = nearestDatum.date?.toLocaleDateString( undefined, {
							month: 'short',
							day: 'numeric',
						} );
						return [ formattedDate, nearestDatum.value ].join( ': ' );
					} }
				/>
			) : (
				<Notice title={ __( 'No history available' ) }>
					{ __(
						'The Chrome User Experience Report collects speed data from real site visits. Sites with low-traffic don‘t provide enough data to generate historical trends.'
					) }
				</Notice>
			) }
		</>
	);
}
