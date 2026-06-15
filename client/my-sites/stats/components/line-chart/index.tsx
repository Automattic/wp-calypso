import { LineChart, type EventHandlerParams, type DataPointDate } from '@automattic/charts';
import '@automattic/charts/style.css';
import { formatNumber } from '@automattic/number-formatters';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type JSX } from 'react';
import ChartBarTooltip from 'calypso/components/chart/bar-tooltip';
import { useMomentInSite } from '../../hooks/use-moment-site-zone';
import StatsEmptyState from '../../stats-empty-state';

import './styles.scss';

const VIEWPORT_EDGE_PAD = 16;
const FLIP_OFFSET = 24;

function ViewportAwareTooltip( { children }: { children: ReactNode } ) {
	const ref = useRef< HTMLDivElement >( null );
	const [ shiftPx, setShiftPx ] = useState( 0 );

	useLayoutEffect( () => {
		const node = ref.current;
		if ( ! node ) {
			return;
		}
		// visx writes its inline `transform` to the `.visx-tooltip` ancestor.
		// `AccessibleTooltip` from `@automattic/charts` wraps our render
		// output in an extra `<div role="tooltip">`, so that ancestor is our
		// grandparent — `parentElement` would land on the a11y wrapper,
		// which never receives the transform. `closest` walks past it to
		// the actually-transformed node.
		const anchor = node.closest< HTMLElement >( '.visx-tooltip' ) ?? node.parentElement;
		if ( ! anchor ) {
			return;
		}
		const update = () => {
			const anchorLeft = anchor.getBoundingClientRect().left;
			const ownWidth = node.getBoundingClientRect().width;
			const maxRight = window.innerWidth - VIEWPORT_EDGE_PAD;
			const overflow = anchorLeft + ownWidth - maxRight;
			if ( overflow <= 0 ) {
				setShiftPx( 0 );
				return;
			}
			// Prefer flipping to the left of the anchor — that mirrors what
			// visx does against the chart container and leaves comfortable
			// breathing room from the viewport edge.
			const flipShift = -( ownWidth + FLIP_OFFSET );
			if ( anchorLeft + flipShift >= VIEWPORT_EDGE_PAD ) {
				setShiftPx( flipShift );
				return;
			}
			// Not enough room on the left to flip cleanly. Shift just far
			// enough to bring the right edge back inside the viewport,
			// capped so we don't pull the left edge past the padding on
			// the opposite side. When the tooltip is wider than the
			// viewport, an unavoidable left overflow is preferable to
			// clipping the right-aligned values.
			const maxShift = Math.max( 0, anchorLeft - VIEWPORT_EDGE_PAD );
			setShiftPx( -Math.min( overflow, maxShift ) );
		};

		update();

		// visx updates the anchor's inline `transform` asynchronously via
		// `withBoundingRects` setState and on every cursor reposition. Watch
		// the actually-transformed ancestor so we react to the final
		// placement, including the post-mount one that arrives without our
		// children changing.
		const styleObserver = new MutationObserver( update );
		styleObserver.observe( anchor, { attributes: true, attributeFilter: [ 'style' ] } );

		// Content width can change between datums (different number widths,
		// font load, etc.) without moving the anchor — catch that here.
		const sizeObserver = new ResizeObserver( update );
		sizeObserver.observe( node );

		window.addEventListener( 'resize', update );
		return () => {
			styleObserver.disconnect();
			sizeObserver.disconnect();
			window.removeEventListener( 'resize', update );
		};
	}, [] );

	return (
		<div
			ref={ ref }
			className="stats-line-chart-tooltip"
			style={ shiftPx ? { transform: `translateX(${ shiftPx }px)` } : undefined }
		>
			{ children }
		</div>
	);
}

function StatsLineChart( {
	chartData = [],
	formatTimeTick,
	className,
	onClick,
	height = 400,
	emptyState = (
		<StatsEmptyState
			headingText={ translate( 'No data available' ) }
			infoText={ translate( 'Try selecting a different time frame.' ) }
		/>
	),
	zeroBaseline = true,
	fixedDomain = false,
	smartBaseline = false,
	curveType = 'monotone',
}: {
	chartData: Array< {
		label: string;
		icon?: JSX.Element;
		options: object;
		data: Array< DataPointDate >;
	} >;
	formatTimeTick?: ( value: number ) => string;
	className?: string;
	height?: number;
	emptyState: JSX.Element;
	zeroBaseline?: boolean;
	fixedDomain?: boolean;
	/** When true, calculates Y-axis baseline so data occupies ~50% of chart height, capped at 20% below min. */
	smartBaseline?: boolean;
	curveType?: 'smooth' | 'linear' | 'monotone';
	onClick?: ( item: { data: { period: string } } ) => void;
} ) {
	const moment = useMomentInSite();

	const formatTime = formatTimeTick
		? formatTimeTick
		: ( timestamp: number ) => {
				const date = new Date( timestamp );
				return date.toLocaleDateString( undefined, {
					month: 'short',
					day: 'numeric',
				} );
		  };

	const formatValue = ( value: number ) => {
		return value < 100_000
			? value.toFixed( 0 )
			: formatNumber( value, { numberFormatOptions: { notation: 'compact' }, decimals: 1 } );
	};

	const isEmpty = ( chartData?.[ 0 ]?.data || [] ).length === 0;

	const [ minValue, maxValue ] = useMemo( () => {
		const allValues = chartData.flatMap( ( series ) =>
			series.data.map( ( d ) => d.value as number )
		);
		return [ Math.min( ...allValues ), Math.max( ...allValues ) ];
	}, [ chartData ] );

	const yNumTicks = useMemo( () => {
		const uniqueValues = [
			...new Set( chartData.flatMap( ( series ) => series.data.map( ( d ) => d.value ?? 0 ) ) ),
		];

		const maxTicks = uniqueValues.length > 5 ? 5 : uniqueValues.length;

		if ( fixedDomain ) {
			return maxTicks;
		}

		// The only one tick, e.g. [ 2 ] or two ticks not [ 1, 2 ], e.g. [ 1, 3 ].
		if ( maxTicks === 1 || ( maxTicks === 2 && Math.max( ...uniqueValues ) > 2 ) ) {
			return maxTicks;
		}

		return maxTicks - 1;
	}, [ chartData, fixedDomain ] );

	const yScaleDomain = useMemo( () => {
		if ( fixedDomain ) {
			return [ 0, maxValue ] as [ number, number ];
		}
		if ( smartBaseline && minValue > 0 ) {
			const range = maxValue - minValue;
			// Two padding strategies:
			// 1. Range-based: padding = range, so data occupies ~50% of chart
			// 2. Max 20% of min value to avoid excessive empty space
			// Use the smaller of the two.
			const rangePadding = range;
			const maxPadding = minValue * 0.2;
			const padding = Math.min( rangePadding, maxPadding );
			const baseline = Math.max( 0, Math.floor( minValue - padding ) );

			return [ baseline, maxValue ] as [ number, number ];
		}
		return undefined;
	}, [ fixedDomain, smartBaseline, minValue, maxValue ] );

	const yScaleType = useMemo( () => {
		if ( chartData.length <= 1 ) {
			return 'linear';
		}

		const maxValues = chartData.map( ( series ) =>
			Math.max( ...series.data.map( ( d ) => d.value as number ) )
		);
		const [ minMax, maxMax ] = [ Math.min( ...maxValues ), Math.max( ...maxValues ) ];

		// Avoid division by zero
		if ( minMax === 0 ) {
			return 'linear';
		}

		const scacle = maxMax / minMax;
		if ( scacle > 20 && scacle < 200 ) {
			return 'sqrt';
		} else if ( scacle >= 200 ) {
			return 'log';
		}

		return 'linear';
	}, [ chartData ] );

	const seriesIcons = useMemo(
		() =>
			Object.fromEntries(
				chartData
					.filter( ( series ) => series.icon !== undefined )
					.map( ( series ) => [ series.label, series.icon ] as const )
			),
		[ chartData ]
	);

	const renderTooltip = useCallback(
		( {
			tooltipData,
		}: {
			tooltipData?: {
				nearestDatum?: {
					datum: DataPointDate;
					key: string;
				};
				datumByKey?: { [ key: string ]: { datum: DataPointDate } };
			};
		} ) => {
			const nearestDatum = tooltipData?.nearestDatum?.datum;
			if ( ! nearestDatum ) {
				return null;
			}
			const tooltipPoints = Object.entries( tooltipData?.datumByKey || {} ).map(
				( [ key, { datum } ] ) => ( {
					key,
					value: datum.value as number,
				} )
			);

			const tooltipLabel =
				nearestDatum.label || ( nearestDatum.date && moment( nearestDatum.date ).format( 'LL' ) );

			return (
				<ViewportAwareTooltip>
					<div className="module-content-list-item is-date-label">{ tooltipLabel }</div>
					<ul>
						{ tooltipPoints.map( ( point ) => (
							<ChartBarTooltip
								key={ point.key }
								label={ point.key }
								value={ formatNumber( point.value ) }
								icon={ seriesIcons[ point.key ] }
							/>
						) ) }
					</ul>
				</ViewportAwareTooltip>
			);
		},
		[ moment, seriesIcons ]
	);

	const onPointerUp = useCallback(
		( { datum }: EventHandlerParams< DataPointDate > ) => {
			// datum.date is always in the timezone of the browser, we need to use literal date here.
			if ( datum && datum.date ) {
				onClick?.( {
					data: {
						period: `${ datum.date.getFullYear() }-${
							datum.date.getMonth() + 1
						}-${ datum.date.getDate() }`,
					},
				} );
			}
		},
		[ onClick ]
	);

	return (
		<div className={ clsx( 'stats-line-chart', className ) }>
			{ isEmpty && emptyState }
			{ ! isEmpty && (
				<LineChart
					data={ chartData }
					withTooltips
					withGradientFill
					height={ height }
					curveType={ curveType }
					onPointerUp={ onPointerUp }
					margin={ {
						left: 20,
						top: 20,
						bottom: 20,
						right: Math.max( formatValue( maxValue ).length * 10, 40 ), //TODO: we should support this from the lib.
					} }
					options={ {
						yScale: {
							type: yScaleType,
							...( yScaleDomain && { domain: yScaleDomain } ),
							zero: ! smartBaseline && zeroBaseline,
						},
						axis: {
							x: {
								tickFormat: formatTime,
							},
							y: {
								orientation: 'right',
								tickFormat: formatValue,
								numTicks: yNumTicks,
							},
						},
					} }
					renderTooltip={ renderTooltip }
				/>
			) }
		</div>
	);
}

export default StatsLineChart;
