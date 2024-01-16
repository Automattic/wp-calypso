import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DragEndEvent } from '@dnd-kit/core';
import type { CSSProperties } from 'react';

interface DndKitSortableItemProps {
	id: string;
	item: any;
}

interface DndKitSortableProps {
	items: any[];
	onDragEnd: ( newOrder: any[] ) => void;
}

const DndKitSortableItem = ( { id, item }: DndKitSortableItemProps ) => {
	const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable( {
		id,
	} );

	const style = {
		position: 'relative',
		transform: CSS.Translate.toString( transform ),
		transition,
		zIndex: isDragging ? 1 : undefined,
	} as CSSProperties;

	return (
		<li ref={ setNodeRef } style={ style } { ...attributes } { ...listeners }>
			{ item }
		</li>
	);
};

const DndKitSortable = ( { items, onDragEnd }: DndKitSortableProps ) => {
	const itemsKeys = items.map( ( item ) => item.key );

	const sensors = useSensors(
		useSensor( PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		} ),
		useSensor( KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		} )
	);

	const handleDragEnd = ( event: DragEndEvent ) => {
		const { active, over } = event;
		if ( ! over || active.id === over.id ) {
			return;
		}

		const oldIndex = itemsKeys.indexOf( active.id );
		const newIndex = itemsKeys.indexOf( over.id );

		const newOrder = arrayMove( itemsKeys, oldIndex, newIndex );
		onDragEnd( newOrder );
	};

	return (
		<DndContext
			collisionDetection={ closestCenter }
			sensors={ sensors }
			onDragEnd={ handleDragEnd }
		>
			<SortableContext items={ itemsKeys } strategy={ verticalListSortingStrategy }>
				{ items.map( ( item ) => (
					<DndKitSortableItem key={ item.key } id={ item.key } item={ item } />
				) ) }
			</SortableContext>
		</DndContext>
	);
};

export default DndKitSortable;
