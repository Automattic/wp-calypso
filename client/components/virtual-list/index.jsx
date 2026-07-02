import { useWindowVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';

const noop = () => {};

// Used only as a last-resort estimate when a consumer provides neither a
// `getRowHeight` value nor a `defaultRowHeight`. Real heights are measured from
// the DOM once each row renders, so this just seeds the initial layout.
const FALLBACK_ROW_HEIGHT = 100;

// Rows rendered above and below the visible range, mirroring the prefetch feel
// of react-virtualized's default overscan.
const OVERSCAN_ROW_COUNT = 5;

function range( start, end ) {
	if ( end < start ) {
		return range( end, start ).reverse();
	}
	const length = end - start + 1;
	return Array.from( { length }, ( _, i ) => i + start );
}

/**
 * A window-scrolled, dynamically-measured virtualized list built on TanStack
 * Virtual. The list lays out at its full content height within the page flow
 * and the window itself is the scroll container, so no surrounding scroll
 * wrapper is required. Row heights are estimated from `getRowHeight` and then
 * measured from the DOM, and pages are requested as the visible range moves.
 * @param {Object} props
 * @param {Array} [props.items] The items backing the list.
 * @param {number} [props.lastPage] The last page available; caps page requests.
 * @param {boolean} [props.loading] Whether a page is currently loading.
 * @param {Function} [props.getRowHeight] `({ index }) => number` height estimate.
 * @param {Function} [props.renderRow] `({ index }) => ReactNode` row renderer.
 * @param {number} [props.perPage] Items per page, used to map indexes to pages.
 * @param {number} [props.loadOffset] Rows of lookahead when requesting pages.
 * @param {Object} [props.query] Active query; `query.number` overrides perPage.
 * @param {number} [props.defaultRowHeight] Estimate used before measurement.
 * @param {Function} [props.onRequestPages] `( pages ) => void` page requester.
 * @param {string} [props.className] Extra class on the list container.
 */
function VirtualList( {
	items = [],
	lastPage = 0,
	loading = false,
	getRowHeight = noop,
	renderRow = noop,
	perPage = 100,
	loadOffset = 10,
	query = {},
	defaultRowHeight,
	onRequestPages = noop,
	className,
} ) {
	const translate = useTranslate();

	// State (not a ref) so the scroll margin recomputes once the list attaches.
	const [ listElement, setListElement ] = useState( null );
	const [ scrollMargin, setScrollMargin ] = useState( 0 );

	useEffect( () => {
		if ( ! listElement ) {
			return;
		}
		const measure = () => {
			const next = listElement.getBoundingClientRect().top + window.scrollY;
			setScrollMargin( ( current ) => ( current === next ? current : next ) );
		};
		measure();
		const observer = new ResizeObserver( measure );
		observer.observe( listElement );
		observer.observe( document.body );
		return () => observer.disconnect();
	}, [ listElement ] );

	// An extra trailing row stands in as a loading placeholder while a page is in
	// flight or before the first page resolves; the consumer's `renderRow`
	// renders it from an out-of-range index.
	const showPlaceholderRow = loading || ! items;
	const rowCount = ( items?.length ?? 0 ) + ( showPlaceholderRow ? 1 : 0 );

	const estimateSize = useCallback(
		( index ) => {
			const measured = getRowHeight( { index } );
			return typeof measured === 'number' ? measured : defaultRowHeight ?? FALLBACK_ROW_HEIGHT;
		},
		[ getRowHeight, defaultRowHeight ]
	);

	const virtualizer = useWindowVirtualizer( {
		count: rowCount,
		estimateSize,
		overscan: OVERSCAN_ROW_COUNT,
		scrollMargin,
	} );

	// Re-measure when the backing items change so stale heights are not reused
	// for indexes whose content changed (e.g. a new search).
	useEffect( () => {
		virtualizer.measure();
	}, [ items, virtualizer ] );

	const virtualItems = virtualizer.getVirtualItems();
	const firstIndex = virtualItems[ 0 ]?.index;
	const lastIndex = virtualItems[ virtualItems.length - 1 ]?.index;

	// Request the pages covering the visible range (plus a lookahead offset),
	// mirroring react-virtualized's onRowsRendered + InfiniteLoader behaviour.
	useEffect( () => {
		if ( firstIndex === undefined || lastIndex === undefined ) {
			return;
		}
		const rowsPerPage = query.number || perPage;
		const getPageForIndex = ( index ) => {
			const page = Math.ceil( index / rowsPerPage );
			return Math.max( Math.min( page, lastPage || Infinity ), 1 );
		};
		const pagesToRequest = range(
			getPageForIndex( firstIndex - loadOffset ),
			getPageForIndex( lastIndex + loadOffset )
		);
		if ( pagesToRequest.length ) {
			onRequestPages( pagesToRequest );
		}
	}, [ firstIndex, lastIndex, query.number, perPage, lastPage, loadOffset, onRequestPages ] );

	const classes = clsx( 'virtual-list', className, { 'is-loading': loading } );

	// Loaded with no items to show.
	if ( rowCount === 0 ) {
		return (
			<div className={ classes }>
				<div className="virtual-list__list-row is-empty">{ translate( 'No results found.' ) }</div>
			</div>
		);
	}

	return (
		<div ref={ setListElement } className={ classes }>
			<div
				style={ {
					position: 'relative',
					inlineSize: '100%',
					blockSize: virtualizer.getTotalSize(),
				} }
			>
				{ virtualItems.map( ( virtualRow ) => (
					<div
						key={ virtualRow.key }
						data-index={ virtualRow.index }
						ref={ virtualizer.measureElement }
						style={ {
							position: 'absolute',
							insetBlockStart: 0,
							insetInlineStart: 0,
							inlineSize: '100%',
							transform: `translateY(${ virtualRow.start - scrollMargin }px)`,
						} }
					>
						{ renderRow( { index: virtualRow.index } ) }
					</div>
				) ) }
			</div>
		</div>
	);
}

VirtualList.propTypes = {
	items: PropTypes.array,
	lastPage: PropTypes.number,
	loading: PropTypes.bool,
	getRowHeight: PropTypes.func,
	renderRow: PropTypes.func,
	perPage: PropTypes.number,
	loadOffset: PropTypes.number,
	query: PropTypes.object,
	defaultRowHeight: PropTypes.number,
	onRequestPages: PropTypes.func,
	className: PropTypes.string,
};

export default VirtualList;
