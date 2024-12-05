import { useLocale } from '@automattic/i18n-utils';
import { hexToRgb } from '@automattic/onboarding';
import _ from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import {
	CampaignChartSeriesData,
	ChartResolution,
} from 'calypso/data/promote-post/use-campaign-chart-stats-query';
import { ChartSourceOptions } from 'calypso/my-sites/promote-post-i2/components/campaign-item-details';
import 'uplot/dist/uPlot.min.css';
import { formatCents } from 'calypso/my-sites/promote-post-i2/utils';

const DEFAULT_DIMENSIONS = {
	height: 300,
	width: 650,
};

type GraphProps = {
	data: CampaignChartSeriesData[];
	source: ChartSourceOptions;
	resolution: ChartResolution;
};

const CampaignStatsLineChart = ( { data, source, resolution }: GraphProps ) => {
	const [ width, setWidth ] = useState( DEFAULT_DIMENSIONS.width );
	const hourly = resolution === ChartResolution.Hour;
	const tooltipRef = useRef< HTMLDivElement | null >( null );
	const lineRef = useRef< HTMLDivElement | null >( null );

	const accentColour = getComputedStyle( document.body )
		.getPropertyValue( '--color-accent' )
		.trim();
	const primaryRGB = hexToRgb( accentColour );

	const updateWidth = () => {
		const wrapperElement = document.querySelector(
			'.campaign-item-details__graph-stats-row'
		) as HTMLElement;
		if ( wrapperElement ) {
			const newWidth = wrapperElement.offsetWidth - 32;
			setWidth( newWidth );
		}
	};

	useEffect( () => {
		// Set initial width
		updateWidth();
		window.addEventListener( 'resize', updateWidth );

		return () => {
			// Remove on unmount
			window.removeEventListener( 'resize', updateWidth );
		};
	}, [] );

	// Convert ISO date string to Unix timestamp
	const labels = data.map( ( entry ) => new Date( entry.date_utc ).getTime() / 1000 );
	const values = data.map( ( entry ) => entry.total );

	// Convert to uPlot's AlignedData format
	const uplotData: uPlot.AlignedData = [ new Float64Array( labels ), new Float64Array( values ) ];
	const locale = useLocale();

	const formatDate = ( date: Date, hourly: boolean ) => {
		const options: Intl.DateTimeFormatOptions = hourly
			? { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }
			: { month: 'short', day: 'numeric' };
		return new Intl.DateTimeFormat( locale, options ).format( date );
	};

	const tooltipPlugin = {
		hooks: {
			init: ( u: uPlot ) => {
				if ( ! tooltipRef.current ) {
					tooltipRef.current = document.createElement( 'div' );
					tooltipRef.current.className = 'campaign-item-details__chart-tooltip';
					tooltipRef.current.style.position = 'absolute';
					tooltipRef.current.style.pointerEvents = 'none';
					tooltipRef.current.style.background = 'black';
					tooltipRef.current.style.color = 'white';
					tooltipRef.current.style.padding = '8px 10px';
					tooltipRef.current.style.borderRadius = '4px';
					tooltipRef.current.style.display = 'none';
					u.over.parentNode?.appendChild( tooltipRef.current );
				}

				if ( ! lineRef.current ) {
					lineRef.current = document.createElement( 'div' );
					lineRef.current.className = 'campaign-item-details__chart-tooltip-line';
					lineRef.current.style.position = 'absolute';
					lineRef.current.style.width = '2px';
					lineRef.current.style.background = 'rgba(0, 0, 0, 0.12)';
					lineRef.current.style.top = '0';
					lineRef.current.style.bottom = '50px';
					lineRef.current.style.display = 'none';
					u.over.parentNode?.appendChild( lineRef.current );
				}

				u.over.addEventListener( 'mousemove', ( e ) => {
					if ( ! tooltipRef.current || ! lineRef.current ) {
						return;
					}
					const { left, top } = u.over.getBoundingClientRect();
					const mouseLeft = e.clientX - left;
					const mouseTop = e.clientY - top;

					const idx = u.posToIdx( mouseLeft );
					if ( idx >= 0 && idx < u.data[ 0 ].length ) {
						const date = u.data[ 0 ][ idx ];
						const value = u.data[ 1 ][ idx ];
						if ( value != null ) {
							tooltipRef.current.style.display = 'block';
							tooltipRef.current.style.left = mouseLeft + 'px';
							tooltipRef.current.style.top = mouseTop + 'px';
							tooltipRef.current.innerHTML = `
								<div class="campaign-item-details__chart-tooltip-date"><strong>${ formatDate(
									new Date( date * 1000 ),
									hourly
								) }</strong></div>
								<div class="campaign-item-details__chart-tooltip-divider"></div>
								<div class="campaign-item-details__chart-tooltip-data">${ formatValue( value ) }</div>
							`;

							lineRef.current.style.display = 'block';

							lineRef.current.style.left = mouseLeft + tooltipRef.current.offsetWidth / 2 + 'px';
							lineRef.current.style.top = mouseTop + 50 + 'px';
						} else {
							tooltipRef.current.style.display = 'none';
							lineRef.current.style.display = 'none';
						}
					} else {
						tooltipRef.current.style.display = 'none';
						lineRef.current.style.display = 'none';
					}
				} );

				u.over.addEventListener( 'mouseleave', () => {
					if ( tooltipRef.current ) {
						tooltipRef.current.style.display = 'none';
					}
					if ( lineRef.current ) {
						lineRef.current.style.display = 'none';
					}
				} );
			},
			destroy: () => {
				if ( tooltipRef.current && tooltipRef.current.parentNode ) {
					tooltipRef.current.parentNode.removeChild( tooltipRef.current );
					tooltipRef.current = null;
				}
				if ( lineRef.current && lineRef.current.parentNode ) {
					lineRef.current.parentNode.removeChild( lineRef.current );
					lineRef.current = null;
				}
			},
		},
	};

	function formatValue( rawValue: number ) {
		if ( rawValue == null ) {
			return '-';
		}

		if ( source === ChartSourceOptions.Spend ) {
			return `$${ formatCents( rawValue, 2 ) }`;
		}

		return rawValue.toLocaleString();
	}

	const options = useMemo( () => {
		return {
			class: 'campaign-item-details__uplot-chart',
			width: width,
			height: DEFAULT_DIMENSIONS.height,
			tzDate: ( ts: number ) => new Date( ts * 1000 ),
			axes: [
				{
					// x-axis
					grid: {
						show: false,
					},
					ticks: {
						show: false,
					},
					gap: 12,
					values: ( u: uPlot, splits: number[] ) => {
						// Filter the splits to show only non-overlapping labels
						return splits.map( ( s, i ) =>
							i % 4 === 0 ? formatDate( new Date( s * 1000 ), hourly ) : ''
						);
					},
				},
				{
					// y-axis
					grid: {
						stroke: 'rgba(0, 0, 0, 0.05)',
						width: 1,
					},
					ticks: {
						show: false,
					},
					gap: 12,
				},
			],
			cursor: {
				x: false,
				y: false,
				points: {
					size: 12,
					width: 3,
					fill: '#fff',
				},
			},
			legend: {
				show: false, // This will hide the legend
			},
			series: [
				{
					label: 'Date',
					value: ( self: uPlot, rawValue: number ) => {
						if ( rawValue == null ) {
							return '-';
						}
						return formatDate( new Date( rawValue * 1000 ), hourly );
					},
				},
				{
					label: _.capitalize( source ),
					stroke: accentColour,
					width: 3,
					fill: ( self: uPlot ) => {
						const { r, g, b } = primaryRGB;

						//Get the height so we can create a gradient
						const height = self?.bbox?.height;
						if ( ! height || ! isFinite( height ) ) {
							return `rgba(${ r }, ${ g }, ${ b }, 0.1)`;
						}

						// Create a gradient based on the theme color and the height of the graph
						const gradient = self.ctx.createLinearGradient( 0, height, 0, 0 );
						gradient.addColorStop( 0, `rgba(${ r }, ${ g }, ${ b }, 0.02)` );
						gradient.addColorStop( 1, `rgba(${ r }, ${ g }, ${ b }, 0.1)` );
						return gradient;
					},
					paths: ( u: uPlot, seriesIdx: number, idx0: number, idx1: number ) => {
						const { linear } = uPlot.paths;
						return linear?.()( u, seriesIdx, idx0, idx1 ) || null;
					},
					points: {
						show: false,
					},
					value: ( self: uPlot, rawValue: number ) => {
						return formatValue( rawValue );
					},
				},
			],
			plugins: [ tooltipPlugin ],
		};
	}, [ width, source, accentColour, formatDate, hourly, primaryRGB ] );

	return (
		<div style={ { position: 'relative' } }>
			<UplotReact options={ options } data={ uplotData } />
		</div>
	);
};

export default CampaignStatsLineChart;
