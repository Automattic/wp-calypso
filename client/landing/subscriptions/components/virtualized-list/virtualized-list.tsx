import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useState, type JSX } from 'react';

type VirtualizedListFunctionProps< T > = {
	item: T;
	key: string;
	style: React.CSSProperties;
	registerChild: ( node: Element | null ) => void;
};

type VirtualizedListProps< T > = {
	// The "children" prop can have a type of "T"
	items: T[];
	children: ( props: VirtualizedListFunctionProps< T > ) => JSX.Element;
	width?: number;
};

// All rows render at equal height, so a single estimate seeds the layout before
// each row is measured from the DOM.
const ESTIMATED_ROW_HEIGHT = 100;

// Rows rendered above and below the visible range, mirroring react-virtualized's
// default overscan behaviour.
const OVERSCAN_ROW_COUNT = 10;

const getScrollContainer = ( node: HTMLElement | null ): HTMLElement | null => {
	// Fall back to the window (null) if the node is missing or it's the root element.
	if ( ! node || node.ownerDocument === node.parentNode ) {
		return null;
	}

	// Return when overflow is defined to either auto or scroll.
	const { overflowY } = getComputedStyle( node );
	if ( /(auto|scroll)/.test( overflowY ) ) {
		return node;
	}

	// Continue traversing if parentNode is an HTMLElement.
	const parentNode = node.parentNode;
	if ( parentNode && parentNode instanceof HTMLElement ) {
		return getScrollContainer( parentNode );
	}

	// Fall back to the window (null) if no scroll container is found.
	return null;
};

const VirtualizedList = < T, >( { items, children }: VirtualizedListProps< T > ) => {
	// State (not a ref) so the scroll container and margin recompute once the
	// list attaches to the DOM.
	const [ listElement, setListElement ] = useState< HTMLDivElement | null >( null );
	const [ scrollElement, setScrollElement ] = useState< HTMLElement | null >( null );
	const [ scrollMargin, setScrollMargin ] = useState( 0 );

	// Resolve the nearest scrollable ancestor; falls back to the window
	// (`scrollElement === null`) when none is found.
	useEffect( () => {
		setScrollElement( getScrollContainer( listElement ) );
	}, [ listElement ] );

	// Offset (px) from the top of the scroll container to the top of the list, so
	// the scroll position maps to the right items when content sits above the list.
	useEffect( () => {
		if ( ! listElement ) {
			return;
		}
		const measure = () => {
			const listTop = listElement.getBoundingClientRect().top;
			const next = scrollElement
				? listTop - scrollElement.getBoundingClientRect().top + scrollElement.scrollTop
				: listTop + window.scrollY;
			setScrollMargin( ( current ) => ( current === next ? current : next ) );
		};
		measure();
		const observer = new ResizeObserver( measure );
		observer.observe( listElement );
		observer.observe( scrollElement ?? document.body );
		return () => observer.disconnect();
	}, [ listElement, scrollElement ] );

	const virtualizer = useVirtualizer< Element, Element >( {
		count: items?.length ?? 0,
		// `getScrollElement` returns the resolved scrollable ancestor, or the
		// document scrolling element when the list scrolls with the window.
		getScrollElement: () => scrollElement ?? document.scrollingElement ?? document.documentElement,
		estimateSize: () => ESTIMATED_ROW_HEIGHT,
		overscan: OVERSCAN_ROW_COUNT,
		scrollMargin,
	} );

	const virtualItems = virtualizer.getVirtualItems();

	return (
		<div ref={ setListElement }>
			<div
				style={ {
					position: 'relative',
					inlineSize: '100%',
					blockSize: virtualizer.getTotalSize(),
				} }
			>
				{ virtualItems.map( ( virtualRow ) => {
					const item = items?.[ virtualRow.index ];
					if ( ! item ) {
						return null;
					}
					// `measureElement` reads `data-index` off the row node to know which
					// row it is measuring, so set it on the consumer's row element before
					// handing the node to the virtualizer.
					const registerChild = ( node: Element | null ) => {
						if ( node ) {
							node.setAttribute( 'data-index', String( virtualRow.index ) );
						}
						virtualizer.measureElement( node );
					};
					return children( {
						item,
						key: virtualRow.key.toString(),
						registerChild,
						style: {
							position: 'absolute',
							insetBlockStart: 0,
							insetInlineStart: 0,
							inlineSize: '100%',
							transform: `translateY(${ virtualRow.start - scrollMargin }px)`,
						},
					} );
				} ) }
			</div>
		</div>
	);
};

export default VirtualizedList;
