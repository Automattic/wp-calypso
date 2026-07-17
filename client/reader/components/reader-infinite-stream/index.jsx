import { pickBy } from '@automattic/js-utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce } from '@wordpress/compose';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useScrollMargin } from 'calypso/reader/hooks/use-infinite-list/use-scroll-margin';
import { recordTracksRailcarRender } from 'calypso/reader/stats';
import './style.scss';

const noop = () => {};

// Calypso's Reader scrolls inside an inner overflow container, not the window.
// Resolve the list's nearest scrollable ancestor so the virtualizer observes the
// right element; a window virtualizer never sees scroll here, so the stream would
// render trailing placeholders that never page in (READ-601). If no scrollable
// ancestor is found, fall back to the document scroller as a best-effort default
// so the list still renders — note this element virtualizer won't observe true
// window scroll (that needs a window virtualizer), but the only consumer (the
// search sites column) always has an inner scroll container, so that's moot.
const getScrollParent = ( node ) => {
	let current = node?.parentElement ?? null;
	while ( current ) {
		const { overflowY } = window.getComputedStyle( current );
		if ( overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay' ) {
			return current;
		}
		current = current.parentElement;
	}
	return ( typeof document !== 'undefined' && document.scrollingElement ) || null;
};

// Rows rendered above and below the visible range, mirroring the prefetch feel
// of react-virtualized's default overscan.
const OVERSCAN_ROW_COUNT = 5;

// Number of trailing placeholder rows kept while another page can still load,
// matching the previous `items.length + 10` behaviour so trailing loaders
// render before the next page resolves.
const PLACEHOLDER_ROW_COUNT = 10;

/**
 * One measured row. Holds its own DOM node so it can remeasure just itself when
 * the consumer's component calls `onShouldMeasure` (e.g. after an image loads),
 * preserving the react-virtualized `onShouldMeasure` contract without forcing a
 * full-list remeasure. The wrapper keeps the absolute transform `style` and the
 * `reader-infinite-stream__row-wrapper` class that the stylesheet relies on.
 */
function MeasuredRow( { index, style, measureElement, ComponentToMeasure, componentProps } ) {
	const nodeRef = useRef( null );

	const setNode = useCallback(
		( node ) => {
			nodeRef.current = node;
			// `virtualizer.measureElement` is itself a ref callback; forward to it
			// so the per-row ResizeObserver attaches and initial size is captured.
			measureElement( node );
		},
		[ measureElement ]
	);

	const handleShouldMeasure = useCallback( () => {
		if ( nodeRef.current ) {
			measureElement( nodeRef.current );
		}
	}, [ measureElement ] );

	return (
		<div
			data-index={ index }
			ref={ setNode }
			style={ style }
			className="reader-infinite-stream__row-wrapper"
		>
			<ComponentToMeasure { ...componentProps } onShouldMeasure={ handleShouldMeasure } />
		</div>
	);
}

MeasuredRow.propTypes = {
	index: PropTypes.number.isRequired,
	style: PropTypes.object.isRequired,
	measureElement: PropTypes.func.isRequired,
	ComponentToMeasure: PropTypes.elementType.isRequired,
	componentProps: PropTypes.object,
};

/**
 * A dynamically-measured infinite stream built on TanStack Virtual. The list
 * lays out at its full content height within the page flow and virtualizes
 * against its nearest scrollable ancestor (Reader content scrolls in an inner
 * container, not the window). Row heights are seeded from `minHeight` and then
 * measured from the DOM (via a ResizeObserver-backed `measureElement`), so
 * variable, content-driven heights reflow automatically.
 *
 * Public API (consumed by other Reader components — preserve this contract):
 * @param {Object} props
 * @param {Array} props.items The items backing the stream.
 * @param {number} props.width Pixel width passed through to row renderers.
 * @param {Function} props.rowRenderer Required. Called per row with
 *   `{ items, extraRenderItemProps, rowRendererProps, measuredRowRenderer }`.
 *   `rowRendererProps` carries `{ key, index, style }`.
 * @param {Function} [props.fetchNextPage] `( offset ) => void`, called when the
 *   end of the rendered range is reached and `hasNextPage` is true.
 * @param {Function} [props.hasNextPage] `( length ) => boolean`.
 * @param {Object} [props.windowScrollerRef] Forwarded ref exposing an
 *   imperative handle (`scrollToOffset`, `scrollToIndex`, `updatePosition`).
 * @param {Object} [props.extraRenderItemProps] Extra props forwarded to rows.
 * @param {number} [props.minHeight] Estimated/minimum row height before measure.
 */
function ReaderInfiniteStream( {
	items,
	width,
	rowRenderer,
	fetchNextPage = noop,
	hasNextPage = () => false,
	windowScrollerRef,
	extraRenderItemProps,
	minHeight = 70,
} ) {
	// State (not a ref) so the scroll container / margin recompute once the list attaches.
	const [ listElement, setListElement ] = useState( null );
	const [ scrollElement, setScrollElement ] = useState( null );

	// Resolve the scroll container from the mounted list. Reader content scrolls in
	// an inner element, so the virtualizer must observe it rather than the window.
	useEffect( () => {
		setScrollElement( listElement ? getScrollParent( listElement ) : null );
	}, [ listElement ] );

	// Offset (px) from the top of the scroll container to the top of the list, so
	// the scroll position maps to the right items even when a header sits above it.
	const scrollMargin = useScrollMargin( listElement, scrollElement );

	const itemsLength = items.length;
	const moreToLoad = hasNextPage( itemsLength );
	const rowCount = moreToLoad ? itemsLength + PLACEHOLDER_ROW_COUNT : itemsLength;

	const estimateSize = useCallback( () => minHeight, [ minHeight ] );

	const virtualizer = useVirtualizer( {
		count: rowCount,
		getScrollElement: () => scrollElement,
		estimateSize,
		overscan: OVERSCAN_ROW_COUNT,
		scrollMargin,
	} );

	// Used to ensure we only fire the railcar render event once per item index.
	const recordedRender = useRef( new Set() );

	// Guards `fetchNextPage` against being spammed on every measurement render
	// near the end. We remember the length we already requested a page for and
	// only request again once `items` actually grew past it (a new page landed).
	const requestedForLength = useRef( -1 );

	const virtualItems = virtualizer.getVirtualItems();
	const lastIndex = virtualItems[ virtualItems.length - 1 ]?.index;

	// Paging: when the rendered range reaches the end and more pages remain,
	// request the next page exactly once per page boundary.
	useEffect( () => {
		if (
			moreToLoad &&
			lastIndex !== undefined &&
			lastIndex >= rowCount - 1 &&
			requestedForLength.current !== itemsLength
		) {
			requestedForLength.current = itemsLength;
			fetchNextPage( itemsLength );
		}
	}, [ moreToLoad, lastIndex, rowCount, itemsLength, fetchNextPage ] );

	// Width-driven height reflow is detected automatically by the per-row
	// ResizeObserver in `measureElement`. We keep a debounced safety-net remeasure
	// on window resize so any layout the observer cannot see (e.g. a media query
	// flip that does not change a measured element's box) still settles.
	useEffect( () => {
		const handleResize = debounce( () => virtualizer.measure(), 50 );
		window.addEventListener( 'resize', handleResize );
		return () => {
			handleResize.cancel?.();
			window.removeEventListener( 'resize', handleResize );
		};
	}, [ virtualizer ] );

	// Expose an imperative handle in place of the old WindowScroller instance.
	// No current consumer reads this ref, but it is part of the public API, so we
	// keep equivalent affordances backed by the virtualizer / window scroll.
	useImperativeHandle(
		windowScrollerRef,
		() => ( {
			scrollToOffset: ( offset, options ) => virtualizer.scrollToOffset( offset, options ),
			scrollToIndex: ( index, options ) => virtualizer.scrollToIndex( index, options ),
			// react-virtualized's WindowScroller exposed `updatePosition` to force a
			// re-sync after layout changes; mirror it with a remeasure.
			updatePosition: () => virtualizer.measure(),
		} ),
		[ virtualizer ]
	);

	const measureElement = virtualizer.measureElement;

	const measuredRowRenderer = useCallback(
		( ComponentToMeasure, props, { key, index, style } ) => (
			<MeasuredRow
				key={ key }
				index={ index }
				style={ style }
				measureElement={ measureElement }
				ComponentToMeasure={ ComponentToMeasure }
				componentProps={ props }
			/>
		),
		[ measureElement ]
	);

	const renderRow = useCallback(
		( rowRendererProps ) => {
			const railcar = items[ rowRendererProps.index ]?.railcar;
			if ( railcar && ! recordedRender.current.has( rowRendererProps.index ) ) {
				recordedRender.current.add( rowRendererProps.index );
				const {
					index,
					railcar: railcarValue,
					eventName,
				} = pickBy( {
					index: rowRendererProps.index,
					railcar,
				} );
				recordTracksRailcarRender( eventName, railcarValue, { ui_position: index } );
			}

			return rowRenderer( {
				items,
				extraRenderItemProps,
				rowRendererProps,
				measuredRowRenderer,
			} );
		},
		[ items, extraRenderItemProps, rowRenderer, measuredRowRenderer ]
	);

	const totalSize = virtualizer.getTotalSize();

	const innerStyle = useMemo(
		() => ( {
			position: 'relative',
			inlineSize: width,
			blockSize: totalSize,
		} ),
		[ width, totalSize ]
	);

	return (
		<div ref={ setListElement }>
			<div style={ innerStyle }>
				{ virtualItems.map( ( virtualRow ) =>
					renderRow( {
						key: virtualRow.key,
						index: virtualRow.index,
						style: {
							position: 'absolute',
							insetBlockStart: 0,
							insetInlineStart: 0,
							inlineSize: '100%',
							transform: `translateY(${ virtualRow.start - scrollMargin }px)`,
						},
					} )
				) }
			</div>
		</div>
	);
}

ReaderInfiniteStream.propTypes = {
	items: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	rowRenderer: PropTypes.func.isRequired,
	fetchNextPage: PropTypes.func,
	hasNextPage: PropTypes.func,
	// A ref (object or callback) receiving the imperative handle.
	windowScrollerRef: PropTypes.oneOfType( [ PropTypes.func, PropTypes.object ] ),
	extraRenderItemProps: PropTypes.object,
	minHeight: PropTypes.number,
};

export default ReaderInfiniteStream;
