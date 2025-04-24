import { useState, useCallback, useRef } from 'react';
import type { GridLayoutItem } from './types';

type DragItem = {
	index: number;
	key: string;
};

export function useDraggableGrid(
	layout: GridLayoutItem[],
	editMode: boolean,
	onChangeLayout?: ( newLayout: GridLayoutItem[] ) => void
) {
	const originalLayoutRef = useRef< GridLayoutItem[] >( layout );
	const [ draggedItem, setDraggedItem ] = useState< DragItem | null >( null );
	const [ tempLayout, setTempLayout ] = useState< GridLayoutItem[] | null >( null );

	const handleDragStart = useCallback(
		( e: React.DragEvent, key: string, index: number ) => {
			if ( ! editMode ) {
				return;
			}

			setDraggedItem( { key, index } );
			e.dataTransfer.setData( 'text/plain', key );
			e.dataTransfer.effectAllowed = 'move';

			const initLayout = layout.map( ( item, idx ) => ( {
				...item,
				order: idx,
			} ) );

			originalLayoutRef.current = [ ...initLayout ];
			setTempLayout( initLayout );

			if ( e.currentTarget instanceof HTMLElement ) {
				e.currentTarget.style.opacity = '0.5';
			}
		},
		[ editMode, layout ]
	);

	const handleDragOver = useCallback(
		( e: React.DragEvent ) => {
			if ( ! editMode || ! draggedItem ) {
				return;
			}
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
		},
		[ editMode, draggedItem ]
	);

	const handleDragEnter = useCallback(
		( e: React.DragEvent, targetKey: string, targetIndex: number ) => {
			if ( ! editMode || ! draggedItem || draggedItem.key === targetKey || ! tempLayout ) {
				return;
			}

			e.preventDefault();

			const updatedLayout = tempLayout.map( ( item ) => {
				const newItem = { ...item };

				if ( item.key === draggedItem.key ) {
					newItem.order = targetIndex;
				} else if ( item.key === targetKey ) {
					newItem.order = draggedItem.index;
				}

				return newItem;
			} );

			setTempLayout( updatedLayout );
			setDraggedItem( {
				...draggedItem,
				index: targetIndex,
			} );
		},
		[ editMode, draggedItem, tempLayout ]
	);

	const handleDragEnd = useCallback(
		( e: React.DragEvent ) => {
			if ( ! editMode ) {
				return;
			}

			if ( e.currentTarget instanceof HTMLElement ) {
				e.currentTarget.style.opacity = '';
			}

			if ( tempLayout ) {
				onChangeLayout?.( tempLayout );
			}

			setTempLayout( null );
			setDraggedItem( null );
		},
		[ editMode, onChangeLayout, tempLayout ]
	);

	const handleDrop = useCallback(
		( e: React.DragEvent ) => {
			if ( ! editMode ) {
				return;
			}
			e.preventDefault();
		},
		[ editMode ]
	);

	return {
		handleDragStart,
		handleDragOver,
		handleDragEnter,
		handleDragEnd,
		handleDrop,
		isDragging: !! draggedItem,
		tempLayout,
	};
}
