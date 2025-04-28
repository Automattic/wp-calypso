import { useLocale } from '@automattic/i18n-utils';
import { hexToRgb } from '@automattic/onboarding';
import _, { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import {
	CampaignChartSeriesData,
	ChartResolution,
} from 'calypso/data/promote-post/use-campaign-chart-stats-query';
import { ChartSourceOptions } from 'calypso/my-sites/promote-post-i2/components/campaign-item-details';
import 'uplot/dist/uPlot.min.css';
import { tooltip } from 'calypso/my-sites/promote-post-i2/components/campaign-stats-line-chart/index.tsx/tooltip';
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

	const accentColor = getComputedStyle( document.body ).getPropertyValue( '--color-accent' ).trim();
	const chartColor = hexToRgb( accentColor );

	const updateWidth = () => {
		const wrapperElement = document.querySelector(
			'.campaign-item-details__graph-stats-row'
		) as HTMLElement;
		if ( wrapperElement ) {
			const newWidth = wrapperElement.offsetWidth - 32;
			setWidth( newWidth );
		}
	};

	const debouncedUpdateWidth = debounce( updateWidth, 200 );

	useEffect( () => {
		// Set initial width
		updateWidth();
		window.addEventListener( 'resize', debouncedUpdateWidth );

		return () => {
			// Remove on unmount
			window.removeEventListener( 'resize', debouncedUpdateWidth );
		};
	}, [ debouncedUpdateWidth ] );

	// Convert ISO date string to Unix timestamp
	const labels = data.map( ( entry ) => new Date( entry.date_utc ).getTime() / 1000 );
	const values = data.map( ( entry ) => entry.total );

	// Convert to uPlot's AlignedData format
	const uplotData: uPlot.AlignedData = [ new Float64Array( labels ), new Float64Array( values ) ];

	const locale = useLocale();

	const options = useMemo( () => {
		const formatDate = ( date: Date, hourly: boolean ) => {
			const options: Intl.DateTimeFormatOptions = hourly
				? { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }
				: { month: 'short', day: 'numeric' };
			return new Intl.DateTimeFormat( locale, options ).format( date );
		};

		const tooltipPlugin = tooltip( tooltipRef, formatDate, hourly, formatValue );

		function formatValue( rawValue: number ) {
			if ( rawValue == null ) {
				return '-';
			}

			if ( source === ChartSourceOptions.Spend ) {
				return `$${ formatCents( rawValue, 2 ) }`;
			}

			return rawValue.toLocaleString();
		}

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
					gap: 16,
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
					gap: 16,
					size: 60,
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
			scales: {
				y: {
					range: ( self: uPlot, min: number, max: number ): [ number, number ] => {
						if ( min === 0 && max === 0 ) {
							// If all values are 0, set a default range
							return [ 0, 1 ];
						}
						// Increase the scale by 40%, this allows extra space for the tooltip
						const padding = ( max - min ) * 0.4;
						return [ min, max + padding ];
					},
				},
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
					stroke: accentColor,
					width: 3,
					fill: ( self: uPlot ) => {
						const { r, g, b } = chartColor;

						// Get the height so we can create a gradient
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
						show: true,
					},
					value: ( self: uPlot, rawValue: number ) => {
						return formatValue( rawValue );
					},
				},
			],
			plugins: [ tooltipPlugin ],
		};
	}, [ hourly, width, source, accentColor, locale, chartColor ] );

	return (
		<div style={ { position: 'relative' } }>
			<UplotReact options={ options } data={ uplotData } />
		</div>
	);
};

export default CampaignStatsLineChart;
