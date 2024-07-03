import {
	CellMeasurer,
	CellMeasurerCache,
	List,
	WindowScroller,
} from '@automattic/react-virtualized';
import React, { useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
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
	const windowScrollerRef = useRef();
	const scrollContainerRef = useRef< HTMLElement | Window >( window );

	useEffect( () => {
		if ( windowScrollerRef.current ) {
			const domNode = ReactDOM.findDOMNode( windowScrollerRef.current ) as HTMLElement;
			scrollContainerRef.current = getScrollContainer( domNode );
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
		<WindowScroller ref={ windowScrollerRef } scrollElement={ scrollContainerRef.current }>
			{ ( {
				height,
				scrollTop,
				registerChild,
			}: {
				height: number;
				scrollTop: number;
				registerChild: React.Ref< HTMLDivElement >;
			} ) => {
				return (
					<div ref={ registerChild }>
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
