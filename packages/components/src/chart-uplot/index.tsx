import { useTranslate } from 'i18n-calypso';
import throttle from 'lodash/throttle';
import { useMemo, useState, useRef, useEffect } from 'react';
import UplotReact from 'uplot-react';
import type uPlot from 'uplot';

import './style.scss';

const DEFAULT_DIMENSIONS = {
	height: 300,
	width: 1224,
};

const THROTTLE_DURATION = 400; // in ms
interface UplotChartProps {
	data: uPlot.AlignedData;
	options?: Partial< uPlot.Options >;
}

function useResize(
	uplotRef: React.RefObject< uPlot >,
	containerRef: React.RefObject< HTMLDivElement >
) {
	useEffect( () => {
		if ( ! uplotRef.current || ! containerRef.current ) {
			return;
		}

		const resizeChart = throttle( () => {
			// Repeat the check since resize can happen much later than event registration.
			if ( ! uplotRef.current || ! containerRef.current ) {
				return;
			}

			// Only update width, not height.
			uplotRef.current.setSize( {
				height: uplotRef.current.height,
				width: containerRef.current.clientWidth,
			} );
		}, THROTTLE_DURATION );
		resizeChart();
		window.addEventListener( 'resize', resizeChart );

		// Cleanup on unmount.
		return () => window.removeEventListener( 'resize', resizeChart );
	}, [ uplotRef, containerRef ] );
}

// NOTE: Do not include this component in the package entry bundle!
// Doing so will unnecessarily bloat the package bundle size.
export default function UplotChart( { data, options: propOptions }: UplotChartProps ) {
	const translate = useTranslate();
	const uplot = useRef< uPlot | null >( null );
	const uplotContainer = useRef( null );

	const [ options ] = useState< uPlot.Options >(
		useMemo(
			() => ( {
				class: 'calypso-uplot-chart',
				...DEFAULT_DIMENSIONS,
				padding: [ 16, 8, 16, 8 ],
				axes: [
					{
						// x-axis
						grid: {
							show: false,
						},
						ticks: {
							stroke: '#646970',
							width: 1,
							size: 3,
						},
					},
					{
						// y-axis
						side: 1,
						gap: 8,
						space: 40,
						size: 50,
						grid: {
							stroke: '#DCDCDE',
							width: 1,
						},
						ticks: {
							show: false,
						},
					},
				],
				cursor: {
					x: false,
					y: false,
				},
				series: [
					{
						label: translate( 'Date' ),
					},
					{
						fill: 'rgba(48, 87, 220, 0.075)',
						label: translate( 'Subscribers' ),
						stroke: '#3057DC',
						width: 2,
						points: {
							show: false,
						},
					},
				],
				legend: {
					isolate: true,
				},
				...( typeof propOptions === 'object' ? propOptions : {} ),
			} ),
			[ propOptions, translate ]
		)
	);

	useResize( uplot, uplotContainer );

	return (
		<div className="calypso-uplot-chart-container" ref={ uplotContainer }>
			<UplotReact
				data={ data }
				onCreate={ ( chart ) => ( uplot.current = chart ) }
				options={ options }
			/>
		</div>
	);
}
