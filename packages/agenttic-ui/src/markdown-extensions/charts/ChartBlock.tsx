/**
 * External dependencies
 */
import type { DataPointDate, SeriesData } from '@automattic/charts';
import type { RenderTooltipParams } from '@visx/xychart/lib/components/Tooltip';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { ChartData, ChartDataPoint, ChartExtensionConfig } from '../types';
import type { CurrencyOptions } from './BaseChart';
import { BarChart } from './BarChart';
import { ChartError } from './ChartError';
import { ChartErrorBoundary } from './ChartErrorBoundary';
import { LineChart } from './LineChart';

export interface ChartBlockProps {
	data: string;
	className?: string;
	config?: ChartExtensionConfig[ 'config' ];
}

interface ChartErrorState {
	message: string;
	details?: string;
}

interface TooltipDatumInfo {
	datum: DataPointDate;
}

/**
 * Chart data after processing JSON input (uses @automattic/charts types)
 */
interface ProcessedChartData {
	chartType: 'line' | 'bar';
	title?: string;
	data: SeriesData[];
	currency?: CurrencyOptions;
	mode?: 'time-comparison' | 'item-comparison';
}

/**
 * ChartBlock component that renders interactive charts from markdown code blocks
 *
 * Supports JSON format chart data:
 * {
 *   "chartType": "line",
 *   "title": "Revenue Trend",
 *   "data": [
 *     {
 *       "label": "Revenue",
 *       "data": [
 *         {"date": "2024-01-01", "value": 1000},
 *         {"date": "2024-01-02", "value": 1200}
 *       ]
 *     }
 *   ]
 * }
 * @param root0
 * @param root0.data
 * @param root0.className
 * @param root0.config
 */
export const ChartBlock: FC< ChartBlockProps > = ( {
	data,
	className = '',
	config,
} ) => {
	const [ error, setError ] = useState< ChartErrorState | null >( null );
	const [ chartData, setChartData ] = useState< ProcessedChartData | null >(
		null
	);
	const [ containerWidth, setContainerWidth ] = useState< number >( 300 );
	const resizeObserverRef = useRef< ResizeObserver | null >( null );

	const customRenderTooltip = useCallback(
		( params: RenderTooltipParams< DataPointDate > ) => {
			const { tooltipData } = params;
			const nearestDatum = tooltipData?.nearestDatum?.datum;

			if ( ! nearestDatum ) {
				return null;
			}

			const formatValue = ( value: number ) => {
				if ( chartData?.currency ) {
					const { symbol, symbolPosition } = chartData.currency;
					let formattedValue: string;

					if ( value >= 1000000 ) {
						formattedValue = `${ ( value / 1000000 ).toFixed(
							1
						) }M`;
					} else if ( value >= 1000 ) {
						formattedValue = `${ ( value / 1000 ).toFixed( 1 ) }K`;
					} else {
						formattedValue = value.toLocaleString();
					}

					return symbolPosition === 'right'
						? `${ formattedValue }${ symbol }`
						: `${ symbol }${ formattedValue }`;
				}

				if ( value >= 1000000 ) {
					return `${ ( value / 1000000 ).toFixed( 1 ) }M`;
				} else if ( value >= 1000 ) {
					return `${ ( value / 1000 ).toFixed( 1 ) }K`;
				}
				return value.toLocaleString();
			};

			const formatDate = ( date: Date ) => {
				const now = new Date();
				const diffInDays = Math.floor(
					( now.getTime() - date.getTime() ) / ( 1000 * 60 * 60 * 24 )
				);

				if ( diffInDays === 0 ) {
					return __( 'Today', 'a8c-agenttic' );
				} else if ( diffInDays === 1 ) {
					return __( 'Yesterday', 'a8c-agenttic' );
				} else if ( diffInDays < 7 ) {
					return sprintf(
						/* translators: %d: number of days */
						__( '%d days ago', 'a8c-agenttic' ),
						diffInDays
					);
				}

				return date.toLocaleDateString( 'en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
				} );
			};

			const productName = nearestDatum.label;
			const tooltipPoints = Object.entries(
				tooltipData?.datumByKey || {}
			)
				.map( ( [ key, datumInfo ] ) => {
					const datum = ( datumInfo as TooltipDatumInfo ).datum;
					return {
						key,
						value: datum.value as number,
					};
				} )
				.sort( ( a, b ) => b.value - a.value );
			return (
				<div>
					{ productName && (
						<div
							style={ {
								fontSize: '12px',
								fontWeight: 'bold',
								marginBottom: '4px',
								color: '#1e1e1e',
								borderBottom: '1px solid #eee',
								paddingBottom: '2px',
							} }
						>
							{ productName }
						</div>
					) }
					{ nearestDatum.date && (
						<div
							style={ {
								fontSize: '10px',
								opacity: 0.8,
								marginBottom: '4px',
							} }
						>
							{ formatDate( nearestDatum.date ) }
						</div>
					) }
					{ tooltipPoints.map( ( point ) => (
						<div
							key={ point.key }
							style={ { marginBottom: '2px' } }
						>
							<strong>{ point.key }:</strong>{ ' ' }
							{ formatValue( point.value ) }
						</div>
					) ) }
				</div>
			);
		},
		[ chartData?.currency ]
	);

	useEffect( () => {
		setError( null );
		setChartData( null );

		if ( ! data || typeof data !== 'string' ) {
			setError( {
				message: __( 'Invalid chart data provided', 'a8c-agenttic' ),
				details: `Input data: ${ data }`,
			} );
			return;
		}

		try {
			const rawData: ChartData = JSON.parse( data.trim() );

			if ( ! rawData.chartType ) {
				setError( {
					message: __(
						'Chart data must include chartType',
						'a8c-agenttic'
					),
					details: __( 'Available types: line, bar', 'a8c-agenttic' ),
				} );
				return;
			}

			if ( ! rawData.data || ! Array.isArray( rawData.data ) ) {
				setError( {
					message: __(
						'Chart data must include a data array',
						'a8c-agenttic'
					),
					details: `Input data: ${ data }`,
				} );
				return;
			}

			if ( rawData.data.length === 0 ) {
				setError( {
					message: __(
						'No data points found for chart',
						'a8c-agenttic'
					),
					details: `Input data: ${ data }`,
				} );
				return;
			}

			// Process dates for line charts - convert string dates to Date objects so we have something consistent to work with
			const processedDataSeries = rawData.data.map( ( series ) => ( {
				...series,
				data: series.data.map( ( point: ChartDataPoint ) => {
					if ( point.date ) {
						const parsedDate = new Date( point.date );
						if ( isNaN( parsedDate.getTime() ) ) {
							console.warn(
								`Invalid date string: "${ point.date }" in series "${ series.label }"`
							);
							return {
								label: point.label,
								value: point.value,
								date: undefined,
							};
						}
						return {
							label: point.label,
							value: point.value,
							date: parsedDate,
						};
					}
					// For points without dates
					return {
						label: point.label,
						value: point.value,
						date: undefined,
					};
				} ),
			} ) );

			const processedData: ProcessedChartData = {
				chartType: rawData.chartType,
				title: rawData.title,
				data: processedDataSeries,
				currency: rawData.currency,
				mode: rawData.mode || 'time-comparison',
			};

			setChartData( processedData );
		} catch ( parseError ) {
			setError( {
				message: __(
					'Failed to parse chart data as JSON',
					'a8c-agenttic'
				),
				details: `Input data: ${ data }`,
			} );
		}
	}, [ data ] );

	const setContainerRef = useCallback( ( node: HTMLDivElement | null ) => {
		if ( resizeObserverRef.current ) {
			resizeObserverRef.current.disconnect();
		}

		if ( node ) {
			const { width } = node.getBoundingClientRect();
			const contentWidth = Math.max( 280, width - 4 );
			setContainerWidth( contentWidth );

			// Resize the charts if the container resizes (we go from floating to sidebar/embedded with a different width)
			resizeObserverRef.current = new ResizeObserver( ( entries ) => {
				for ( const entry of entries ) {
					const resizedWidth = entry.contentRect.width;
					const resizedContentWidth = Math.max(
						280,
						resizedWidth - 4
					);
					setContainerWidth( resizedContentWidth );
				}
			} );
			resizeObserverRef.current.observe( node );
		}
	}, [] );

	useEffect( () => {
		return () => {
			if ( resizeObserverRef.current ) {
				resizeObserverRef.current.disconnect();
				resizeObserverRef.current = null;
			}
		};
	}, [] );

	if ( error ) {
		return (
			<ChartError message={ error.message } details={ error.details } />
		);
	}

	if ( ! chartData ) {
		return (
			<ChartError
				message={ __( 'No chart data available', 'a8c-agenttic' ) }
			/>
		);
	}

	const hasMultipleSeries = chartData.data.length > 1;
	const shouldShowLegend = hasMultipleSeries;
	const chartWidth = containerWidth;

	const commonProps = {
		data: chartData.data,
		currency: chartData.currency,
		showLegend: shouldShowLegend,
		withTooltips: true,
		renderTooltip: customRenderTooltip,
		error: null,
		maxWidth: chartWidth,
		aspectRatio: 1.2,
		resizeDebounceTime: 300,
	};

	const renderChart = () => {
		switch ( chartData.chartType ) {
			case 'line':
				return <LineChart { ...commonProps } />;
			case 'bar':
				return (
					<BarChart
						{ ...commonProps }
						mode={
							chartData.mode as
								| 'time-comparison'
								| 'item-comparison'
						}
					/>
				);
			default:
				return (
					<ChartError
						message={ sprintf(
							/* translators: %s: chart type name */
							__( 'Unsupported chart type: %s', 'a8c-agenttic' ),
							chartData.chartType
						) }
					/>
				);
		}
	};

	return (
		<ChartErrorBoundary chartData={ data }>
			<div
				ref={ setContainerRef }
				className={ `chart-block ${ className }` }
			>
				{ chartData.title && (
					<h3 className="chart-block-title">{ chartData.title }</h3>
				) }
				<div className="chart-container">{ renderChart() }</div>
			</div>
		</ChartErrorBoundary>
	);
};
