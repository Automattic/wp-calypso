import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useResizeObserver, useDebounce, useEvent } from '@wordpress/compose';
import { useMemo, Children, isValidElement, useState } from 'react';
import { GridItem } from './grid-item';
import type { GridLayoutItem, GridProps } from './types';
import type { DragOverEvent } from '@dnd-kit/core';
import type { ReactNode, ReactElement } from 'react';

type GridItemWrapperProps = {
	children: ReactNode;
	actionableArea?: ReactNode;
};

function GridItemWrapper( { children }: GridItemWrapperProps ) {
	return children as JSX.Element;
}

export function Grid( {
	layout,
	columns = 6,
	children,
	className,
	spacing = 2,
	rowHeight = 'auto',
	minColumnWidth,
	editMode = false,
	onChangeLayout,
}: GridProps ) {
	// Temporary layout to avoid updating the layout while dragging
	const [ temporaryLayout, setTemporaryLayout ] = useState< GridLayoutItem[] | undefined >(
		layout
	);
	const activeLayout = temporaryLayout || layout;
	const [ containerWidth, setContainerWidth ] = useState( 0 );
	const resizeObserverRef = useResizeObserver( ( [ { contentRect } ] ) => {
		setContainerWidth( contentRect.width );
	} );
	const gapPx = spacing * 4;
	const effectiveColumns = useMemo( () => {
		if ( ! minColumnWidth ) {
			return columns;
		}

		const totalWidthPerColumn = minColumnWidth + gapPx;
		const maxColumns = Math.floor( ( containerWidth + gapPx ) / totalWidthPerColumn );
		return Math.max( 1, maxColumns );
	}, [ minColumnWidth, gapPx, containerWidth, columns ] );
	const columnWidth = ( containerWidth - gapPx ) / effectiveColumns;

	const layoutMap = useMemo( () => {
		const map = new Map< string, GridLayoutItem >();
		activeLayout.forEach( ( item ) => map.set( item.key, item ) );
		return map;
	}, [ activeLayout ] );

	const items = useMemo(
		() =>
			[ ...activeLayout ]
				.sort( ( a, b ) => ( a.order ?? Infinity ) - ( b.order ?? Infinity ) )
				.map( ( item ) => item.key ),
		[ activeLayout ]
	);

	const [ childrenMap, actionableAreasMap, remaining ] = useMemo( () => {
		const map = new Map< string, ReactElement >();
		const actionableAreas = new Map< string, ReactNode >();
		const rest: ReactNode[] = [];

		Children.forEach( children, ( child ) => {
			if ( ! isValidElement( child ) ) {
				rest.push( child );
				return;
			}

			// Handle Grid.Item wrapper
			if ( child.type === GridItemWrapper ) {
				const key = child.key?.toString();
				const itemProps = child.props as {
					children: ReactNode;
					actionableArea?: ReactNode;
				};

				if ( key && layoutMap.has( key ) ) {
					// Get the main child content
					const mainChild = Children.only( itemProps.children );
					map.set( key, mainChild as ReactElement );

					// Get the actionable area if provided
					if ( itemProps.actionableArea ) {
						actionableAreas.set( key, itemProps.actionableArea );
					}
				} else {
					rest.push( itemProps.children );
				}
				return;
			}

			// Handle regular child (backward compatibility)
			const key = child.key?.toString();
			if ( key && layoutMap.has( key ) ) {
				map.set( key, child );

				// Support deprecated actionableArea prop on children
				const childActionableArea = ( child.props as { actionableArea?: ReactNode } )
					?.actionableArea;
				if ( childActionableArea ) {
					// eslint-disable-next-line no-console
					console.warn(
						'Passing `actionableArea` as a prop to Grid children is deprecated. ' +
							'Please use <Grid.Item actionableArea={...}> instead.'
					);
					actionableAreas.set( key, childActionableArea );
				}
			} else {
				rest.push( child );
			}
		} );

		return [ map, actionableAreas, rest ];
	}, [ children, layoutMap ] );

	const sensors = useSensors(
		useSensor( PointerSensor ),
		useSensor( KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		} )
	);

	const handleDragOver = useEvent( ( event: DragOverEvent ) => {
		const { active, over } = event;

		if ( over && active && active.id !== over.id ) {
			const oldIndex = items.indexOf( String( active.id ) );
			const newIndex = items.indexOf( String( over.id ) );
			const updatedItems = arrayMove( items, oldIndex, newIndex );
			const updatedLayout = layout.map( ( item ) => {
				const newOrder = updatedItems.indexOf( item.key );
				return {
					...item,
					order: newOrder,
				};
			} );
			setTemporaryLayout( updatedLayout );
		}
	} );
	const debouncedHandleDragOver = useDebounce( handleDragOver, 100 );

	function persistTemporaryLayout() {
		if ( ! onChangeLayout || ! temporaryLayout ) {
			return;
		}

		onChangeLayout( temporaryLayout );
		setTemporaryLayout( undefined );
	}

	function handleResize( id: string, delta: { width: number; height: number } ) {
		if ( ! editMode ) {
			return;
		}

		const relativeDelta = {
			width: Math.round( delta.width / ( columnWidth + gapPx ) ),
			height: rowHeight === 'auto' ? 0 : Math.round( delta.height / ( rowHeight + gapPx ) ),
		};

		if ( relativeDelta.width !== 0 || relativeDelta.height !== 0 ) {
			// Update the temporary layout with the new size
			const updatedLayout = activeLayout.map( ( item ) => {
				if ( item.key === id ) {
					return {
						...item,
						width: Math.max(
							1,
							Math.min( ( item.width ?? 1 ) + relativeDelta.width, effectiveColumns )
						),
						height: Math.max( 1, ( item.height ?? 1 ) + relativeDelta.height ),
					};
				}
				return item;
			} );
			setTemporaryLayout( updatedLayout );
		}
	}

	return (
		<DndContext
			sensors={ sensors }
			onDragOver={ debouncedHandleDragOver }
			onDragEnd={ () => {
				debouncedHandleDragOver.flush();
				persistTemporaryLayout();
			} }
		>
			<SortableContext items={ items } strategy={ () => null }>
				<div
					ref={ resizeObserverRef }
					className={ className }
					style={ {
						display: 'grid',
						gridTemplateColumns: `repeat(${ effectiveColumns }, 1fr)`,
						gridAutoRows: rowHeight,
						gap: gapPx,
					} }
				>
					{ items.map( ( id ) => (
						<GridItem
							key={ id }
							item={ layoutMap.get( id ) as GridLayoutItem }
							maxColumns={ effectiveColumns }
							disabled={ ! editMode }
							onResize={ ( delta ) => handleResize( id, delta ) }
							onResizeEnd={ persistTemporaryLayout }
							actionableArea={ actionableAreasMap.get( id ) }
						>
							{ childrenMap.get( id ) }
						</GridItem>
					) ) }
					{ remaining }
				</div>
			</SortableContext>
		</DndContext>
	);
}

Grid.Item = GridItemWrapper;
