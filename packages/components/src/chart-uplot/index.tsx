import throttle from 'lodash/throttle';
import { useMemo, useState, useRef, useEffect } from 'react';
import UplotReact from 'uplot-react';

import 'uplot/dist/uPlot.min.css';

const DEFAULT_DIMENSIONS = {
	height: 300,
	width: 1224,
};

interface UplotChartProps {
	data: uPlot.AlignedData;
	options?: Partial< uPlot.Options >;
}

function useResize( uplot: uPlot | null, containerRef: React.RefObject< HTMLDivElement > ) {
	useEffect( () => {
		if ( ! uplot || ! containerRef.current ) {
			return;
		}

		const resizeChart = throttle( () => {
			// Repeat the check since resize can happen much later than event registration.
			if ( ! uplot || ! containerRef.current ) {
				return;
			}

			// Only update width, not height.
			uplot.setSize( {
				height: uplot.height,
				width: containerRef.current.clientWidth,
			} );
		}, 400 );
		resizeChart();
		window.addEventListener( 'resize', resizeChart );

		// Cleanup on unmount.
		return () => window.removeEventListener( 'resize', resizeChart );
	}, [ uplot, containerRef ] );
}

// NOTE: Do not include this component in the package entry bundle!
// Doing so will unnecessarily bloat the package bundle size.
export default function UplotChart( { data, options: propOptions }: UplotChartProps ) {
	const [ uplot, setUplot ] = useState< uPlot | null >( null );
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
					{},
					{
						fill: 'rgba(48, 87, 220, 0.075)',
						label: 'Value',
						stroke: '#3057DC',
						width: 2,
						points: {
							show: false,
						},
					},
				],
				...( typeof propOptions === 'object' ? propOptions : {} ),
			} ),
			[ propOptions ]
		)
	);

	useResize( uplot, uplotContainer );

	return (
		<div className="calypso-uplot-chart-container" ref={ uplotContainer }>
			<UplotReact options={ options } data={ data } onCreate={ ( chart ) => setUplot( chart ) } />
		</div>
	);
}
