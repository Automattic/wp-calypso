import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useResizeObserver, useDebounce, useEvent } from '@wordpress/compose';
import { useMemo, Children, isValidElement, useState } from 'react';
import { GridItem } from './grid-item';
import { resolveFillWidths } from './resolve-fill-widths';
import type { GridLayoutItem, GridProps } from './types';
import type { DragOverEvent } from '@dnd-kit/core';

type GridChildProps = {
	actionableArea?: React.ReactNode;
};

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
	/*
	 * Temporary layout holds pending changes during drag/resize
	 * to show preview without triggering parent re-renders
	 */
	const [ temporaryLayout, setTemporaryLayout ] = useState< GridLayoutItem[] | undefined >();
	const activeLayout = temporaryLayout ?? layout;

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

	// Resolve fillWidth items to concrete column spans.
	// Returns a map of key → resolved GridLayoutItem (with fillWidth replaced by a computed width).
	// Items without fillWidth are returned as-is from layoutMap (same reference).
	const resolvedItemMap = useMemo( () => {
		const fillWidths = resolveFillWidths( items, layoutMap, effectiveColumns );
		if ( fillWidths.size === 0 ) {
			return layoutMap;
		}
		const map = new Map< string, GridLayoutItem >();
		for ( const [ key, item ] of layoutMap ) {
			const fillW = fillWidths.get( key );
			map.set( key, fillW !== undefined ? { ...item, width: fillW } : item );
		}
		return map;
	}, [ items, layoutMap, effectiveColumns ] );

	const [ childrenMap, remaining ] = useMemo( () => {
		const map = new Map< string, React.ReactElement< GridChildProps > >();
		const rest: React.ReactNode[] = [];

		Children.forEach( children, ( child ) => {
			if ( ! isValidElement< GridChildProps >( child ) ) {
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

	const actionableAreaMap = useMemo( () => {
		const map = new Map< string, React.ReactNode >();
		childrenMap.forEach( ( child, key ) => {
			if ( child?.props.actionableArea ) {
				map.set( key, child.props.actionableArea );
			}
		} );
		return map;
	}, [ childrenMap ] );

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

	/*
	 * Commit temporary changes to parent and clear local state
	 * Called when user finishes drag/resize on mouse up
	 */
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
					const resolvedItem = resolvedItemMap.get( id );
					const baseWidth = item.fillWidth
						? resolvedItem?.width ?? item.width ?? 1
						: item.width ?? 1;
					return {
						...item,
						width: Math.max( 1, Math.min( baseWidth + relativeDelta.width, effectiveColumns ) ),
						height: Math.max( 1, ( item.height ?? 1 ) + relativeDelta.height ),
						fillWidth: undefined,
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
							item={ resolvedItemMap.get( id ) as GridLayoutItem }
							maxColumns={ effectiveColumns }
							disabled={ ! editMode }
							onResize={ ( delta ) => handleResize( id, delta ) }
							onResizeEnd={ persistTemporaryLayout }
							actionableArea={ actionableAreaMap.get( id ) }
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
