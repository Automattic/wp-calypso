import {
	CellMeasurer,
	CellMeasurerCache,
	List,
	WindowScroller,
} from '@automattic/react-virtualized';
import React, { useEffect, useCallback, useRef, type JSX } from 'react';
import withDimensions from 'calypso/lib/with-dimensions';

type VirtualizedListFunctionProps< T > = {
	item: T;
	key: string;
	style: React.CSSProperties;
	registerChild: React.Ref< HTMLDivElement >;
};

type VirtualizedListProps< T > = {
	// The "children" prop can have a type of "T"
	items: T[];
	children: ( props: VirtualizedListFunctionProps< T > ) => JSX.Element;
	width?: number;
};

const cellMeasureCache = new CellMeasurerCache( {
	fixedWidth: true,
	// Since all our rows are of equal height, we can use this performance optimization
	keyMapper: () => 1,
} );

type RowRenderProps = {
	index: number;
	key: string;
	style: React.CSSProperties;
	parent: unknown;
};

const getScrollContainer = ( node: HTMLElement | null ): HTMLElement | Window => {
	// Default to window if the node is null or it's the root element.
	if ( ! node || node.ownerDocument === node.parentNode ) {
		return window;
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

	// Default to window if no scroll container is found.
	return window;
};

const VirtualizedList = < T, >( { width, items, children }: VirtualizedListProps< T > ) => {
	const contentRef = useRef< HTMLDivElement | null >( null );
	const scrollContainerRef = useRef< HTMLElement | Window >( window );

	useEffect( () => {
		if ( contentRef.current ) {
			scrollContainerRef.current = getScrollContainer( contentRef.current );
		}
	}, [] );

	// WindowScroller hands us a `registerChild` ref through its render prop. We merge it with
	// our own `contentRef` via a stable callback ref: this keeps WindowScroller tracking its
	// DOM node through `registerChild` (so its internal, React 19-removed `findDOMNode`
	// fallback is never hit) while giving us the node to resolve the scroll container.
	const registerChildRef = useRef< React.Ref< HTMLDivElement > >( null );
	const setContentNode = useCallback( ( node: HTMLDivElement | null ) => {
		contentRef.current = node;
		const registerChild = registerChildRef.current;
		if ( typeof registerChild === 'function' ) {
			registerChild( node );
		} else if ( registerChild ) {
			( registerChild as React.MutableRefObject< HTMLDivElement | null > ).current = node;
		}
	}, [] );

	const rowRenderer = useCallback(
		( { index, key, style, parent }: RowRenderProps ) => {
			const item = items?.[ index ];
			return item ? (
				<CellMeasurer
					cache={ cellMeasureCache }
					columnIndex={ 0 }
					key={ key }
					rowIndex={ index }
					parent={ parent }
				>
					{ ( { registerChild }: { registerChild: React.Ref< HTMLDivElement > } ) =>
						children( { item, key, style, registerChild } )
					}
				</CellMeasurer>
			) : null;
		},
		[ items, children ]
	);

	return (
		<WindowScroller scrollElement={ scrollContainerRef.current }>
			{ ( {
				height,
				scrollTop,
				registerChild,
			}: {
				height: number;
				scrollTop: number;
				registerChild: React.Ref< HTMLDivElement >;
			} ) => {
				registerChildRef.current = registerChild;
				return (
					<div ref={ setContentNode }>
						<List
							autoHeight
							rowCount={ items?.length }
							deferredMeasurementCache={ cellMeasureCache }
							rowHeight={ cellMeasureCache.rowHeight }
							height={ height }
							scrollTop={ scrollTop }
							width={ width }
							items={ items }
							rowRenderer={ rowRenderer }
						/>
					</div>
				);
			} }
		</WindowScroller>
	);
};

// cast as typeof VirtualizedList to avoid TS error
export default withDimensions( VirtualizedList ) as typeof VirtualizedList;
