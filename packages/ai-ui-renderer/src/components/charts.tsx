import * as Charts from '@automattic/charts';
import { formatNumber } from '@automattic/number-formatters';
import { useLayoutEffect, useMemo, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { VisuallyHidden } from '@wordpress/ui';
import clsx from 'clsx';
import { useInteractiveUiSurface } from '../contexts/surface';
import { copyTheme } from '../utils/theme';
import type { KeyboardEvent, ReactNode } from 'react';
import '@automattic/charts/style.css';

const CHART_HEIGHT = 240;

// A horizontal bar chart grows with its categories, so each keeps room for its label.
const CATEGORY_ROW_HEIGHT = 24;

// The library resolves the SVG's tokens against the page, not the surface, so the axis labels and
// legend use the surface's text color instead, as `style.scss` does for the axes and grid. The
// series colors are plain colors, as the library reads them, each with at least 3:1 contrast on
// white and on #1e1e1e.
const CHART_THEME: Partial< Charts.ChartTheme > = {
	// The library outlines the points a tooltip marks with this color, resolved against the page.
	backgroundColor: 'transparent',
	colors: [ '#4f6bed', '#d65d00', '#008a8a', '#8c5fd9', '#d94f8a', '#008a20' ],
	svgLabelSmall: { fill: 'currentColor', fontSize: 12, fontWeight: 400 },
	legend: { labelStyles: { color: 'inherit' } },
};

// Bars and lines start from zero, so they don't exaggerate differences.
const FROM_ZERO = { zero: true };

// A long category name would squeeze a horizontal chart's bars, so the axis shortens it, and the
// tooltip shows it in full. Vertical bars cut theirs to fit their width.
const MAX_CATEGORY_LENGTH = 20;

function shortenCategory( value: unknown ) {
	const label = String( value );

	return label.length > MAX_CATEGORY_LENGTH
		? `${ label.slice( 0, MAX_CATEGORY_LENGTH - 1 ) }…`
		: label;
}

// Dates follow the page's language, as the chat's text does, rather than the browser's. A page
// language that isn't a valid locale, such as `de_formal`, falls back to the browser's.
function getPageLocale() {
	try {
		return Intl.getCanonicalLocales( document.documentElement.lang )[ 0 ];
	} catch {
		return undefined;
	}
}

function formatDate( date: Date ) {
	return date.toLocaleDateString( getPageLocale(), { dateStyle: 'medium' } );
}

// As the library's own ticks do, these name days, or years once the data spans two years or more.
const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

function getDateTickFormat( dates: Date[] ) {
	const times = dates.map( ( date ) => date.getTime() );
	const format: Intl.DateTimeFormatOptions =
		Math.max( ...times ) - Math.min( ...times ) >= TWO_YEARS_MS
			? { year: 'numeric' }
			: { month: 'short', day: 'numeric' };

	return ( value: unknown ) =>
		new Date( value as number ).toLocaleDateString( getPageLocale(), format );
}

interface Series< Point > {
	label: string;
	data: Point[];
}

interface ChartTable {
	headings: string[];
	rows: string[][];
}

const getLabel = ( { label }: { label: string } ) => label;

const getDateKey = ( { date }: { date: Date } ) => formatDate( date );

// The library draws data it can't chart as its own English error, or draws it wrong, so a chart
// throws instead: the surface then shows its fallback and reports the error.
function assertUnique( values: string[], name: string ) {
	const duplicate = values.find( ( value, index ) => values.indexOf( value ) !== index );

	if ( duplicate !== undefined ) {
		throw new Error( `A chart repeats the ${ name } “${ duplicate }”.` );
	}
}

function assertSeries< Point >( series: Series< Point >[], getKey: ( point: Point ) => string ) {
	assertUnique( series.map( getLabel ), 'series' );
	series.forEach( ( { data } ) => assertUnique( data.map( getKey ), 'point' ) );
}

function findPoint< Point >( data: Point[], getKey: ( point: Point ) => string, key: string ) {
	return data.find( ( point ) => getKey( point ) === key );
}

// A row per key, such as a date or a category, with each series' value.
function getChartTable< Point extends { value: number } >(
	keyHeading: string,
	series: Series< Point >[],
	getKey: ( point: Point ) => string
): ChartTable {
	const keys = [ ...new Set( series.flatMap( ( { data } ) => data.map( getKey ) ) ) ];

	return {
		headings: [ keyHeading, ...series.map( getLabel ) ],
		rows: keys.map( ( key ) => [
			key,
			...series.map( ( { data } ) => {
				const point = findPoint( data, getKey, key );

				return point ? formatNumber( point.value ) : '';
			} ),
		] ),
	};
}

interface ChartFigureProps {
	className?: string;
	title: string;
	table: ChartTable;
	children: ReactNode;
}

// The library moves keyboard focus onto its tooltip, in a portal at the end of the page, and doesn't
// bring it back: Tab would leave the chat, and closing the tooltip drops focus. So focus returns to
// the chart first, and Tab moves on from there.
function returnFocusToChart( event: KeyboardEvent< HTMLElement > ) {
	const figure = event.currentTarget;
	const chart = figure.querySelector< HTMLElement >( '[role="grid"]' );

	if ( event.key === 'Tab' && ! figure.contains( document.activeElement ) ) {
		chart?.focus();
		return;
	}

	requestAnimationFrame( () => {
		if ( document.activeElement === document.body ) {
			chart?.focus();
		}
	} );
}

// The library's SVG doesn't expose the data, so screen readers get it as a table instead.
function ChartFigure( { className, title, table, children }: ChartFigureProps ) {
	return (
		// The keys come from the chart and its tooltip, whose portal's events bubble here.
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<figure
			className={ clsx( 'ai-ui-renderer__chart', className ) }
			onKeyDown={ returnFocusToChart }
		>
			<figcaption className="ai-ui-renderer__chart-title">{ title }</figcaption>

			<Charts.GlobalChartsProvider theme={ CHART_THEME }>{ children }</Charts.GlobalChartsProvider>

			<VisuallyHidden>
				<table>
					<thead>
						<tr>
							{ table.headings.map( ( heading, index ) => (
								<th key={ index } scope="col">
									{ heading }
								</th>
							) ) }
						</tr>
					</thead>
					<tbody>
						{ table.rows.map( ( [ key, ...values ] ) => (
							<tr key={ key }>
								<th scope="row">{ key }</th>
								{ values.map( ( value, index ) => (
									<td key={ index }>{ value }</td>
								) ) }
							</tr>
						) ) }
					</tbody>
				</table>
			</VisuallyHidden>
		</figure>
	);
}

interface ChartTooltipProps {
	heading: string;
	rows: { label?: string; value: number }[];
}

// The library renders tooltips in a portal on the page, so a tooltip copies its surface's theme, as
// the modal does, and its font, since the portal's own box sets one.
function ChartTooltip( { heading, rows }: ChartTooltipProps ) {
	const { rootRef } = useInteractiveUiSurface();
	const ref = useRef< HTMLDivElement >( null );

	useLayoutEffect( () => {
		if ( rootRef?.current && ref.current ) {
			copyTheme( rootRef.current, ref.current );
			ref.current.style.fontFamily = getComputedStyle( rootRef.current ).fontFamily;
		}
	}, [ rootRef ] );

	// The library keeps a tooltip within the window, but the surface, such as a chat, can be narrower,
	// so once the library has placed it, it moves back within the surface's edges.
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
					<strong>{ formatNumber( value ) }</strong>
				</div>
			) ) }
		</div>
	);
}

// A bar's tooltip names its category, and a line's its date, then each series' value there. The
// values come from the chart's data, as the library's tooltip data keeps points from earlier hovers
// and, from the keyboard, only one series'.
function getSeriesTooltip< Point extends { value: number } >(
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

// The legend shows each slice's share, so the tooltip shows its value.
function renderPieTooltip( { tooltipData }: Charts.PieChartRenderTooltipParams ) {
	return <ChartTooltip heading={ tooltipData.label } rows={ [ { value: tooltipData.value } ] } />;
}

interface LineChartProps {
	title: string;
	series: Series< { date: string; value: number } >[];
}

export function LineChart( { title, series }: LineChartProps ) {
	// In date order, as the library draws them, so the table and tooltips follow it.
	const data = useMemo( () => {
		assertSeries( series, ( { date } ) => date );

		return series.map( ( { label, data: points } ) => ( {
			label,
			data: points
				.map( ( { date, value } ) => {
					const parsed = Charts.parseAsLocalDate( date );

					// The schema's pattern still allows a date such as 2026-02-30.
					if ( isNaN( parsed.getTime() ) ) {
						throw new Error( `A chart has an invalid date: ${ date }.` );
					}

					return { date: parsed, value };
				} )
				.sort( ( a, b ) => a.date.getTime() - b.date.getTime() ),
		} ) );
	}, [ series ] );

	const table = useMemo(
		() => getChartTable( __( 'Date', 'default' ), data, getDateKey ),
		[ data ]
	);
	const renderTooltip = useMemo( () => getSeriesTooltip( data, getDateKey ), [ data ] );

	const options = useMemo(
		() => ( {
			yScale: FROM_ZERO,
			axis: {
				x: {
					tickFormat: getDateTickFormat(
						data.flatMap( ( { data: points } ) => points.map( ( { date } ) => date ) )
					),
				},
			},
		} ),
		[ data ]
	);

	return (
		<ChartFigure title={ title } table={ table }>
			<Charts.LineChart
				data={ data }
				height={ CHART_HEIGHT }
				options={ options }
				renderTooltip={ renderTooltip }
				showLegend={ series.length > 1 }
				withGradientFill={ false }
			/>
		</ChartFigure>
	);
}

interface BarChartProps {
	title: string;
	series: Series< { label: string; value: number } >[];
	orientation?: 'vertical' | 'horizontal';
}

export function BarChart( { title, series, orientation }: BarChartProps ) {
	const isHorizontal = orientation === 'horizontal';

	const table = useMemo( () => {
		assertSeries( series, getLabel );

		return getChartTable( __( 'Category', 'default' ), series, getLabel );
	}, [ series ] );
	const renderTooltip = useMemo( () => getSeriesTooltip( series, getLabel ), [ series ] );

	// The library draws the first category at the bottom of a horizontal chart, so it gets them in
	// reverse, and a ranking reads from the top.
	const data = useMemo(
		() =>
			isHorizontal
				? series.map( ( { label, data: points } ) => ( { label, data: [ ...points ].reverse() } ) )
				: series,
		[ isHorizontal, series ]
	);

	const categoryCount = table.rows.length;
	const height = isHorizontal
		? Math.max( CHART_HEIGHT, categoryCount * CATEGORY_ROW_HEIGHT )
		: CHART_HEIGHT;

	// The category axis labels every category, as the library otherwise skips some.
	const options = useMemo(
		() =>
			isHorizontal
				? {
						xScale: FROM_ZERO,
						axis: { y: { numTicks: categoryCount, tickFormat: shortenCategory } },
					}
				: {
						yScale: FROM_ZERO,
						axis: { x: { numTicks: categoryCount, labelOverflow: 'ellipsis' as const } },
					},
		[ isHorizontal, categoryCount ]
	);

	return (
		<ChartFigure title={ title } table={ table }>
			<Charts.BarChart
				data={ data }
				height={ height }
				options={ options }
				orientation={ orientation }
				renderTooltip={ renderTooltip }
				showLegend={ series.length > 1 }
				withTooltips
			/>
		</ChartFigure>
	);
}

interface PieChartProps {
	title: string;
	data: { label: string; value: number }[];
}

export function PieChart( { title, data }: PieChartProps ) {
	const table = useMemo( () => {
		const series = [ { label: __( 'Value', 'default' ), data } ];

		assertSeries( series, getLabel );

		if ( ! data.some( ( { value } ) => value > 0 ) ) {
			throw new Error( 'A pie chart needs a value above 0.' );
		}

		return getChartTable( __( 'Category', 'default' ), series, getLabel );
	}, [ data ] );

	// The legend names the slices and their shares, since labels on narrow slices would overlap.
	return (
		<ChartFigure className="ai-ui-renderer__chart--pie" title={ title } table={ table }>
			<Charts.PieChart
				data={ data }
				height={ CHART_HEIGHT }
				renderTooltip={ renderPieTooltip }
				showLabels={ false }
				showLegend
				withTooltips
			/>
		</ChartFigure>
	);
}
