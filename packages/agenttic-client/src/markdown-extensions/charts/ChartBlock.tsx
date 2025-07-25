/**
 * External dependencies
 */
import type { DataPointDate } from '@automattic/charts';
import type { RenderTooltipParams } from '@visx/xychart/lib/components/Tooltip';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Internal dependencies
 */
import type { ChartData, ChartExtensionConfig } from '../types';
import { BarChart } from './BarChart';
import { ChartError } from './ChartError';
import { ChartErrorBoundary } from './ChartErrorBoundary';
import './charts.css';
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
	const [ chartData, setChartData ] = useState< ChartData | null >( null );
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
					return 'Today';
				} else if ( diffInDays === 1 ) {
					return 'Yesterday';
				} else if ( diffInDays < 7 ) {
					return `${ diffInDays } days ago`;
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

	// This is a bit of a hack to prevent the body from overflowing when tooltips are shown
	// TODO: Find a better way to handle this
	useEffect( () => {
		if ( ! error && chartData ) {
			document.body.classList.add( 'has-active-chart' );

			return () => {
				setTimeout( () => {
					const activeCharts =
						document.querySelectorAll( '.chart-block' );
					if ( activeCharts.length <= 1 ) {
						document.body.classList.remove( 'has-active-chart' );
					}
				}, 0 );
			};
		}
	}, [ error, chartData ] );

	useEffect( () => {
		setError( null );
		setChartData( null );

		if ( ! data || typeof data !== 'string' ) {
			setError( {
				message: 'Invalid chart data provided',
				details: `Input data: ${ data }`,
			} );
			return;
		}

		try {
			const parsedData = JSON.parse( data.trim() );

			if ( ! parsedData.chartType ) {
				setError( {
					message: 'Chart data must include chartType',
					details: `Available types: line, bar`,
				} );
				return;
			}

			if ( ! parsedData.data || ! Array.isArray( parsedData.data ) ) {
				setError( {
					message: 'Chart data must include a data array',
					details: `Input data: ${ data }`,
				} );
				return;
			}

			if ( parsedData.data.length === 0 ) {
				setError( {
					message: 'No data points found for chart',
					details: `Input data: ${ data }`,
				} );
				return;
			}

			const processedData: ChartData = {
				chartType: parsedData.chartType,
				title: parsedData.title,
				data: parsedData.data,
				currency: parsedData.currency,
				mode: parsedData.mode || 'time-comparison',
			};

			setChartData( processedData );
		} catch ( parseError ) {
			setError( {
				message: 'Failed to parse chart data as JSON',
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
		return <ChartError message="No chart data available" />;
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
						message={ `Unsupported chart type: ${ chartData.chartType }` }
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
