import { useLayoutEffect, useRef } from '@wordpress/element';
import { useInteractiveUiSurface } from '../contexts/surface';
import { findPoint, formatChartNumber } from '../utils/chart-data';
import { copyTheme } from '../utils/theme';
import type { Series } from '../utils/chart-data';
import type * as Charts from '@automattic/charts';

interface ChartTooltipProps {
	heading: string;
	rows: { label?: string; value: number }[];
}

// Tooltips render in a portal on the page, so a tooltip copies its surface's theme and font.
export function ChartTooltip( { heading, rows }: ChartTooltipProps ) {
	const { rootRef } = useInteractiveUiSurface();
	const ref = useRef< HTMLDivElement >( null );

	useLayoutEffect( () => {
		if ( rootRef?.current && ref.current ) {
			copyTheme( rootRef.current, ref.current );
			ref.current.style.fontFamily = getComputedStyle( rootRef.current ).fontFamily;
		}
	}, [ rootRef ] );

	// The library positions a tooltip against the window, not the surface, so it moves back inside.
	useLayoutEffect( () => {
		const root = rootRef?.current;
		const tooltip = ref.current;

		if ( ! root || ! tooltip ) {
			return;
		}

		const frame = requestAnimationFrame( () => {
			tooltip.style.translate = '';

			const bounds = root.getBoundingClientRect();
			const { left, right } = tooltip.getBoundingClientRect();
			const shift = Math.max( bounds.left - left, Math.min( bounds.right - right, 0 ) );

			tooltip.style.translate = `${ shift }px`;
		} );

		return () => cancelAnimationFrame( frame );
	} );

	return (
		<div ref={ ref } className="ai-ui-renderer__chart-tooltip">
			<div className="ai-ui-renderer__chart-tooltip-heading">{ heading }</div>

			{ rows.map( ( { label, value } ) => (
				<div key={ label ?? heading } className="ai-ui-renderer__chart-tooltip-row">
					{ label && <span>{ label }</span> }
					<strong>{ formatChartNumber( value ) }</strong>
				</div>
			) ) }
		</div>
	);
}

// Shows each series' value at a category or date. The values come from the chart's data, as the
// library's can be stale and, from the keyboard, hold only one series.
export function getSeriesTooltipRenderer< Point extends { value: number } >(
	series: Series< Point >[],
	getKey: ( point: Point ) => string
) {
	return function renderTooltip( {
		tooltipData,
	}: Charts.RenderTooltipParams< Charts.DataPointDate > ) {
		const datum = tooltipData?.nearestDatum?.datum;

		if ( ! datum ) {
			return null;
		}

		const key = getKey( datum as unknown as Point );
		const rows = series.flatMap( ( { label, data } ) => {
			const point = findPoint( data, getKey, key );

			return point ? [ { label, value: point.value } ] : [];
		} );

		return <ChartTooltip heading={ key } rows={ rows } />;
	};
}
