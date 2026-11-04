import { BarChart, LineChart } from '@automattic/charts';
// Without the package's own styles the chart collapses to zero width.
import '@automattic/charts/style.css';
import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import {
	EventEmitterProvider,
	TooltipContext,
	TooltipProvider,
	useEventEmitter,
} from '@visx/xychart';
import moment from 'moment';
import {
	FunctionComponent,
	KeyboardEvent,
	ReactNode,
	useCallback,
	useContext,
	useMemo,
	useRef,
} from 'react';
import { getBucketDays, type ChartRange } from '../lib/date-ranges';
import type {
	DataPoint,
	DataPointDate,
	LineChartProps,
	RenderTooltipParams,
	SeriesData,
} from '@automattic/charts';
import type { ChartType } from 'calypso/my-sites/stats/stats-chart-tabs/chart-type';

// The tooltip renders through @visx/tooltip's portal, which appends to `document.body` —
// outside the roots our stylesheets are scoped to — so these few rules travel with it.
const TOOLTIP_DATE_STYLE = { fontWeight: 600, marginBlockEnd: '4px' };
const TOOLTIP_ROW_STYLE = { display: 'flex', justifyContent: 'space-between', gap: '12px' };

// A press that travels further than this before its release is a drag, not a click.
const CLICK_DRAG_TOLERANCE_PX = 4;

/**
 * The series with no point before the range. A week is keyed by its Monday, which for the
 * first week can fall before the range's first day, where its count starts: that point is
 * drawn, named and read from the first day instead.
 * @param series    The series as fetched.
 * @param startDate The range's first day, as `YYYY-MM-DD`.
 * @returns The series, their points within the range.
 */
function clampToRange( series: SeriesData[], startDate: string ): SeriesData[] {
	const firstDay = moment( startDate, 'YYYY-MM-DD' ).toDate();
	return series.map( ( entry ) => ( {
		...entry,
		data: ( entry.data as DataPointDate[] ).map( ( point ) =>
			point.date && point.date < firstDay ? { ...point, date: firstDay } : point
		),
	} ) );
}

/**
 * Names the days a hovered point covers, in the site locale's order. Not moment's `LL`: in
 * wp-admin, core rewrites it to the site's PHP date format, so moment prints "F j, 2026".
 * Gregorian like the axis, since a locale's default calendar can differ (Persian, Thai).
 * @param date  The hovered point's date: a day, a week's first day, or a month's.
 * @param range The chart's range.
 * @returns The formatted date, or the days of a week.
 */
function formatTooltipDate( date: Date, range: ChartRange ) {
	const options: Intl.DateTimeFormatOptions =
		'month' === range.unit
			? { month: 'long', year: 'numeric', calendar: 'gregory' }
			: { dateStyle: 'long', calendar: 'gregory' };
	const format = new Intl.DateTimeFormat( moment.locale(), options );

	if ( 'week' !== range.unit ) {
		return format.format( date );
	}

	// A week runs to its Sunday, or to the range's last day in its last week. The point
	// already sits on the range's first day when its week starts earlier.
	const weekEnd = moment( getBucketDays( date, range ).endDate, 'YYYY-MM-DD' ).toDate();
	return format.formatRange( date, weekEnd );
}

/**
 * Tooltip for a hovered point. The package's own prints `toLocaleDateString()`, which names
 * a month's total by its first day and ignores the site's locale.
 * @param range              The chart's range.
 * @param series             The series drawn, read at the hovered date.
 * @param params             The chart's tooltip state.
 * @param params.tooltipData The hovered point.
 * @returns The tooltip, or nothing when no point is hovered.
 */
function renderTooltip(
	range: ChartRange,
	series: SeriesData[],
	{ tooltipData }: RenderTooltipParams< DataPointDate >
) {
	const hoveredDate = tooltipData?.nearestDatum?.datum?.date;
	if ( ! hoveredDate ) {
		return null;
	}

	// Each series at the hovered date, not `tooltipData.datumByKey`: on bars, an arrow key
	// moves one series' focus and leaves the other's entry on the bucket it last reported.
	const hoveredTime = hoveredDate.getTime();
	const points = series
		.map( ( { label, data } ) => ( {
			label,
			value:
				data.find(
					( point: DataPoint | DataPointDate ) =>
						'date' in point && point.date?.getTime() === hoveredTime
				)?.value ?? 0,
		} ) )
		.sort( ( a, b ) => b.value - a.value );

	return (
		<div>
			<div style={ TOOLTIP_DATE_STYLE }>{ formatTooltipDate( hoveredDate, range ) }</div>
			{ points.map( ( point ) => (
				<div key={ point.label } style={ TOOLTIP_ROW_STYLE }>
					<span>{ point.label }</span>
					<span>{ formatNumber( point.value ) }</span>
				</div>
			) ) }
		</div>
	);
}

interface OverviewChartProps {
	/** Views, then visitors. */
	series: SeriesData[];
	height: number;
	/** The chart's range, for its bucket and the days a partial week covers. */
	range: ChartRange;
	/** Bars or lines, as the viewer draws the Stats page's chart. */
	chartType: ChartType;
	/** Called with a clicked point's date. Without it the chart takes no clicks. */
	onBucketClick?: ( date: Date ) => void;
}

/** What a press or release reports: the point under it, if any, where it was, and the event. */
interface PointerParams {
	datum?: unknown;
	svgPoint?: { x: number; y: number } | null;
	event?: unknown;
}

/** The handlers of a chart that opens its points. */
interface BucketClickHandlers {
	onPointerDown: ( params: PointerParams ) => void;
	onPointerUp: ( params: PointerParams ) => void;
	/** Opens a point, if the datum is one. */
	open: ( datum: unknown ) => void;
}

/**
 * Whether a press is a plain one by the primary button. A press with a modifier, or by another
 * button, asks for a new tab or a menu, which the chart cannot give; it is left alone, as a
 * link leaves its own.
 * @param event The press's event.
 * @returns Whether the press counts towards a click.
 */
function isPlainPrimaryPress( event: unknown ): boolean {
	const { button, metaKey, ctrlKey, shiftKey, altKey } = ( event ?? {} ) as {
		button?: number;
		metaKey?: boolean;
		ctrlKey?: boolean;
		shiftKey?: boolean;
		altKey?: boolean;
	};
	return 0 === button && ! metaKey && ! ctrlKey && ! shiftKey && ! altKey;
}

/**
 * The date of a chart point.
 * @param datum The point, as the chart reports it.
 * @returns Its date, or nothing for anything else.
 */
function pointDate( datum: unknown ): Date | undefined {
	const date = ( datum as { date?: unknown } | undefined )?.date;
	return date instanceof Date ? date : undefined;
}

/**
 * Handlers that report a click on a point, and leave a drag, a modified or secondary press, or
 * a release that began off the chart alone. Neither chart has a click of its own; the line
 * chart's drag is a zoom only when asked for.
 * @param onBucketClick Called with the clicked point's date.
 * @returns The handlers, or none without a callback, so an unclickable chart listens for nothing.
 */
function useBucketClick( onBucketClick?: ( date: Date ) => void ): BucketClickHandlers | null {
	const pressedAt = useRef< { x: number; y: number } | null >( null );

	const open = useCallback(
		( datum: unknown ) => {
			const date = pointDate( datum );
			if ( date ) {
				onBucketClick?.( date );
			}
		},
		[ onBucketClick ]
	);

	const onPointerDown = useCallback( ( { svgPoint, event }: PointerParams ) => {
		pressedAt.current =
			svgPoint && isPlainPrimaryPress( event ) ? { x: svgPoint.x, y: svgPoint.y } : null;
	}, [] );

	const onPointerUp = useCallback(
		( { datum, svgPoint }: PointerParams ) => {
			const start = pressedAt.current;
			pressedAt.current = null;
			if ( ! start ) {
				return;
			}
			if (
				svgPoint &&
				Math.hypot( svgPoint.x - start.x, svgPoint.y - start.y ) > CLICK_DRAG_TOLERANCE_PX
			) {
				return;
			}
			open( datum );
		},
		[ open ]
	);

	return onBucketClick ? { onPointerDown, onPointerUp, open } : null;
}

// Wraps the chart without entering the layout, so the responsive chart measures its box as before.
const CONTENTS_STYLE = { display: 'contents' } as const;

/**
 * Opens the chart's points from the keyboard, and from the pointer on the bar chart. Enter opens
 * the point the arrow keys have moved to, which the chart reports through its tooltip. The bar
 * chart forwards no pointer events (its package does from 3.2.0; this build is on 1.x), so its
 * presses and releases are taken from the chart's own event emitter, with the bar its tooltip
 * snapped to. Both come from the providers around the chart, which it adopts in place of its own.
 * @param props             Component props.
 * @param props.handlers    The click handlers.
 * @param props.fromEmitter Whether to take presses and releases from the emitter too.
 * @param props.children    The chart.
 */
function ClickableChart( {
	handlers,
	fromEmitter,
	children,
}: {
	handlers: BucketClickHandlers;
	fromEmitter: boolean;
	children: ReactNode;
} ) {
	// Read when asked, not when the handler was made: the tooltip moves in between.
	const tooltip = useContext( TooltipContext );
	const tooltipRef = useRef( tooltip );
	tooltipRef.current = tooltip;
	const focusedDatum = () => tooltipRef.current?.tooltipData?.nearestDatum?.datum;

	const { onPointerDown, onPointerUp, open } = handlers;
	useEventEmitter(
		'pointerdown',
		useCallback(
			( params ) =>
				fromEmitter && onPointerDown( { svgPoint: params?.svgPoint, event: params?.event } ),
			[ fromEmitter, onPointerDown ]
		)
	);
	useEventEmitter(
		'pointerup',
		useCallback(
			( params ) =>
				fromEmitter && onPointerUp( { datum: focusedDatum(), svgPoint: params?.svgPoint } ),
			[ fromEmitter, onPointerUp ]
		)
	);

	const onKeyDown = ( event: KeyboardEvent ) => {
		if ( 'Enter' === event.key ) {
			open( focusedDatum() );
		}
	};

	// Not a control of its own: the chart's points take the focus, and this only hears them.
	return (
		<div style={ CONTENTS_STYLE } onKeyDown={ onKeyDown } role="presentation">
			{ children }
		</div>
	);
}

/**
 * The series as bars, the second drawn inside the first: visitors inside views, as the old
 * widget and the Stats v2 traffic chart draw them, which works since a visitor has at least one
 * view. The package draws a "comparison" series as a wider, lighter bar behind its group's
 * other series, which is this shape.
 * @param series Views, then visitors.
 * @returns The series, grouped.
 */
function nestSeries( series: SeriesData[] ): SeriesData[] {
	const [ outer, inner, ...rest ] = series;
	if ( ! outer || ! inner ) {
		return series;
	}
	const group = 'traffic';
	return [
		{ ...outer, group, options: { ...outer.options, type: 'comparison' } },
		{ ...inner, group },
		...rest,
	];
}

// Room on the right for half a date label ("Sep 30"), since the last tick can fall on the
// last point and centre its label on the edge.
const MARGIN = { left: 32, top: 8, bottom: 20, right: 24 };

/**
 * The Overview chart, loaded as its own chunk so the rest of the widget paints first. Bars or
 * lines over the same series, axes and tooltip.
 * @param props           Component props.
 * @param props.series        The series to plot.
 * @param props.height        Chart height in pixels.
 * @param props.range         The chart's range.
 * @param props.chartType     Bars or lines.
 * @param props.onBucketClick Called with a clicked point's date.
 */
const OverviewChart: FunctionComponent< OverviewChartProps > = ( {
	series,
	height,
	range,
	chartType,
	onBucketClick,
} ) => {
	const { unit } = range;
	const drawn = useMemo(
		() => clampToRange( series, range.startDate ),
		[ series, range.startDate ]
	);
	const clickHandlers = useBucketClick( onBucketClick );
	const options: LineChartProps[ 'options' ] = {
		// From zero, so a range that never approaches it doesn't look more dramatic than it is.
		yScale: { type: 'linear', zero: true },
		axis: {
			x: {
				// A timestamp from the line chart's time scale, a `Date` from the bar chart's bands.
				tickFormat: ( value: number | Date ) =>
					moment( value ).format( 'month' === unit ? 'MMM' : 'MMM D' ),
			},
			// Compact, like the totals. Zero is left to the grid line, and a quiet site's
			// fractional ticks are blanked since views are whole (`hideZero` isn't typed).
			y: {
				orientation: 'left',
				tickFormat: ( value: number ) =>
					0 === value || ! Number.isInteger( value ) ? '' : formatNumberCompact( value ),
			},
		},
	};
	const renderTooltipForRange = ( params: RenderTooltipParams< DataPointDate > ) =>
		renderTooltip( range, drawn, params );

	const chart =
		'bar' === chartType ? (
			<BarChart
				data={ nestSeries( drawn ) }
				withTooltips
				animation
				// A zero-value bar has no height, so a quiet day would otherwise read as missing
				// data. This draws it as a hairline stub instead.
				showZeroValues
				height={ height }
				renderTooltip={ renderTooltipForRange }
				margin={ MARGIN }
				options={ options }
			/>
		) : (
			<LineChart
				data={ drawn }
				withTooltips
				withGradientFill
				animation
				height={ height }
				curveType="monotone"
				renderTooltip={ renderTooltipForRange }
				margin={ MARGIN }
				options={ options }
				onPointerDown={ clickHandlers?.onPointerDown }
				onPointerUp={ clickHandlers?.onPointerUp }
			/>
		);

	if ( ! clickHandlers ) {
		return chart;
	}

	return (
		<EventEmitterProvider>
			<TooltipProvider>
				<ClickableChart handlers={ clickHandlers } fromEmitter={ 'bar' === chartType }>
					{ chart }
				</ClickableChart>
			</TooltipProvider>
		</EventEmitterProvider>
	);
};

export default OverviewChart;
