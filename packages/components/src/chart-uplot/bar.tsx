import { Popover } from '@automattic/components';
import { useEffect, useMemo, useRef, useState } from 'react';
import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import useResize from './hooks/use-resize';
import seriesBarsPlugin from './uplot-plugins/multi-bars';

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
}

export default function UplotBarChart( {
	data,
	labels,
	fillColors = [],
	options: propOptions,
}: UplotChartProps ) {
	const uplot = useRef< uPlot | null >( null );
	const uplotContainer = useRef< HTMLDivElement | null >( null );
	const [ chartDimensions, setChartDimensions ] = useState( DEFAULT_DIMENSIONS );
	const [ legendVisibleIndex, setLegendVisibleIndex ] = useState( -1 );
	const [ legendEl, setLegendEl ] = useState< HTMLElement | null >( null );

	const options: uPlot.Options = useMemo( () => {
		const defaultOptions: uPlot.Options = {
			class: 'calypso-uplot-bar-chart',
			...chartDimensions,
			axes: [
				{},
				{
					show: true,
					side: 1,
				},
			],
			padding: [ null, 0, null, 0 ],
			series: data[ 0 ].map( ( label, i ) => ( {
				label,
				fill: fillColors[ i ],
			} ) ) as uPlot.Series[],
			plugins: [
				seriesBarsPlugin( {
					labels: () => labels,
				} ) as uPlot.Plugin,
			],
			legend: {
				live: false,
				isolate: true,
				mount: ( self: uPlot, el: HTMLElement ) => {
					setLegendEl( el );
				},
			},
		};
		return {
			...defaultOptions,
			...( typeof propOptions === 'object' ? propOptions : {} ),
		};
	}, [ chartDimensions, data, fillColors, labels, propOptions ] );

	useResize( uplot, uplotContainer );

	useEffect( () => {
		// Need extra check for container resize due to `seriesBarsPlugin`
		if ( uplotContainer.current ) {
			const { width, height } = uplotContainer.current.getBoundingClientRect();
			if ( width !== chartDimensions.width || height !== chartDimensions.height ) {
				setChartDimensions( { width, height } );
			}
		}
	}, [ chartDimensions, data ] );

	useEffect( () => {
		if ( legendEl === null ) {
			return;
		}
		function onMouseOverListener( event: MouseEvent ) {
			const target = event.target as HTMLElement | null;
			const legendDirectChildren = target?.closest( '.u-series' );
			if ( ! target || ! legendDirectChildren || ! legendEl ) {
				return;
			}
			if ( target.classList.contains( 'u-label' ) ) {
				const seriesIdx = Array.from( legendEl.children ).indexOf( legendDirectChildren );
				setLegendVisibleIndex( seriesIdx );
			}
		}

		function onMouseLeaveListener( event: MouseEvent ) {
			const target = event.target as HTMLElement | null;
			if ( ! target ) {
				return;
			}
			if ( target.classList.contains( 'u-label' ) ) {
				setLegendVisibleIndex( -1 );
			}
		}

		legendEl.addEventListener( 'mouseover', onMouseOverListener );
		legendEl.addEventListener( 'mouseout', onMouseLeaveListener );

		return () => {
			legendEl.removeEventListener( 'mouseover', onMouseOverListener );
			legendEl.removeEventListener( 'mouseout', onMouseLeaveListener );
		};
	}, [ legendEl ] );

	return (
		<div className="calypso-uplot-chart-container" ref={ uplotContainer }>
			<UplotReact
				data={ data as unknown as uPlot.AlignedData }
				onCreate={ ( chart ) => ( uplot.current = chart ) }
				options={ options }
			/>
			{ legendVisibleIndex >= 0 && legendEl?.children[ legendVisibleIndex ] && (
				<Popover isVisible context={ legendEl.children[ legendVisibleIndex ] } position="top">
					{ fillColors[ legendVisibleIndex ] }
				</Popover>
			) }
		</div>
	);
}
