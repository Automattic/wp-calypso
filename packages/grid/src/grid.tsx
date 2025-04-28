import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResizeObserver } from '@wordpress/compose';
import { useMemo, Children, isValidElement, useState } from 'react';
import ResizeHandle from './resize-handle';
import type { GridLayoutItem, GridProps } from './types';
import type { DragOverEvent } from '@dnd-kit/core';

export function GridItem( {
	item,
	maxColumns,
	disabled = false,
	children,
}: {
	item: GridLayoutItem;
	maxColumns: number;
	disabled?: boolean;
	children: React.ReactNode;
} ) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable( {
		id: item.key,
		disabled,
	} );
	const dragCursor = isDragging ? 'grabbing' : 'grab';
	const style = {
		transform: CSS.Translate.toString( transform ),
		transition,
		gridColumnEnd: `span ${
			item.fullWidth ? maxColumns : Math.min( item.width ?? 1, maxColumns )
		}`,
		gridRowEnd: `span ${ item.height || 1 }`,
		cursor: disabled ? 'default' : dragCursor,
		position: 'relative' as const,
	};

	return (
		<div ref={ setNodeRef } style={ style } { ...attributes } { ...listeners }>
			{ children }
			<ResizeHandle disabled={ disabled } />
		</div>
	);
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
	// Temporary layout to avoid updaing the layout while dragging
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

	const [ childrenMap, remaining ] = useMemo( () => {
		const map = new Map< string, React.ReactElement >();
		const rest: React.ReactNode[] = [];

		Children.forEach( children, ( child ) => {
			if ( ! isValidElement( child ) ) {
				rest.push( child );
				return;
			}

			const key = child.key?.toString();
			if ( key && layoutMap.has( key ) ) {
				map.set( key, child );
			} else {
				rest.push( child );
			}
		} );

		return [ map, rest ];
	}, [ children, layoutMap ] );

	const sensors = useSensors(
		useSensor( PointerSensor ),
		useSensor( KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		} )
	);

	function handleDragOver( event: DragOverEvent ) {
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
	}

	function handleDragEnd() {
		if ( ! onChangeLayout || ! temporaryLayout ) {
			return;
		}

		onChangeLayout( temporaryLayout );
		setTemporaryLayout( undefined );
	}

	return (
		<DndContext sensors={ sensors } onDragOver={ handleDragOver } onDragEnd={ handleDragEnd }>
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
