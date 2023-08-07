import { useMemo, useRef } from 'react';
import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import useResize from './hooks/use-resize';
import seriesBarsPlugin from './uplot-plugins/multi-bars';
// import seriesBarsPlugin from './uplot-plugins/series-bars-plugins';

// NOTE: Do not include this component in the package entry bundle.
//       Doing so will cause tests of the consumer package to break due to uPlot's reliance on matchMedia.
//       https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom.

const DEFAULT_DIMENSIONS = {
	height: 600,
	width: 1224,
};

export interface UplotChartProps {
	data: [ string[], ...number[][] ];
	fillColors: string[];
	labels: string[];
	options?: Partial< uPlot.Options >;
	legendContainer?: React.RefObject< HTMLDivElement >;
}

export default function UplotBarChart( {
	data,
	labels,
	fillColors = [],
	legendContainer,
	options: propOptions,
}: UplotChartProps ) {
	const uplot = useRef< uPlot | null >( null );
	const uplotContainer = useRef( null );

	const options: uPlot.Options = useMemo( () => {
		const defaultOptions: uPlot.Options = {
			class: 'calypso-uplot-bar-chart',
			...DEFAULT_DIMENSIONS,
			axes: [
				{},
				{
					show: true,
					side: 1,
				},
			],
			padding: [ null, 0, null, 0 ],
			series: [
				{},
				...( data[ 0 ].map( ( label, i ) => ( {
					label,
					fill: fillColors[ i ],
				} ) ) as uPlot.Series[] ),
			],
			plugins: [
				seriesBarsPlugin( {
					labels: () => labels,
				} ) as uPlot.Plugin,
			],
			legend: {
				live: false,
				isolate: true,
				mount: ( self: uPlot, el: HTMLElement ) => {
					// If legendContainer is defined, move the legend into it.
					if ( legendContainer?.current ) {
						legendContainer?.current.append( el );
					}
				},
			},
		};
		return {
			...defaultOptions,
			...( typeof propOptions === 'object' ? propOptions : {} ),
		};
	}, [ data, fillColors, labels, legendContainer, propOptions ] );

	useResize( uplot, uplotContainer );

	return (
		<div className="calypso-uplot-chart-container" ref={ uplotContainer }>
			<UplotReact
				data={ data as unknown as uPlot.AlignedData }
				onCreate={ ( chart ) => ( uplot.current = chart ) }
				options={ options }
			/>
		</div>
	);
}
