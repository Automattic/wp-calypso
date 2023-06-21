import {
	CellMeasurer,
	CellMeasurerCache,
	List,
	WindowScroller,
} from '@automattic/react-virtualized';
import React, { useCallback, useRef } from 'react';
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

const VirtualizedList = < T, >( { width, items, children }: VirtualizedListProps< T > ) => {
	const windowScrollerRef = useRef();

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
		<WindowScroller ref={ windowScrollerRef }>
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
