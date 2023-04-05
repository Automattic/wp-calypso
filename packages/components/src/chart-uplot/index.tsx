import { useMemo, useState, useRef } from 'react';
import UplotReact from 'uplot-react';

import 'uplot/dist/uPlot.min.css';

interface UplotChartProps {
	data: uPlot.AlignedData;
	options?: Partial< uPlot.Options >;
}

// NOTE: Do not include this component in the package entry bundle!
// Doing so will unnecessarily bloat the package bundle size.
export default function UplotChart( { data, options: propOptions }: UplotChartProps ) {
	const uplotRef = useRef< uPlot | null >( null );
	const [ options ] = useState< uPlot.Options >(
		useMemo(
			() => ( {
				class: 'calypso-uplot-chart',
				height: 300,
				padding: [ 16, 8, 16, 8 ],
				width: 1224, // TODO: Use container width here.
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

	// TODO: Make chart responsive.

	return (
		<UplotReact
			options={ options }
			data={ data }
			onCreate={ ( chart ) => {
				uplotRef.current = chart;
			} }
		/>
	);
}
