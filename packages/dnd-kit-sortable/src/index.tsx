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

interface DndKitSortableItemProps {
	id: string;
	item: any;
}

interface DndKitSortableProps {
	items: any[];
	onDragEnd: ( newOrder: any[] ) => void;
}

const DndKitSortableItem = ( { id, item }: DndKitSortableItemProps ) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable( { id } );

	const style = {
		transform: CSS.Transform.toString( transform ),
		transition,
	};

	return (
		<li ref={ setNodeRef } style={ style } { ...attributes } { ...listeners }>
			{ item }
		</li>
	);
};

const DndKitSortable = ( { items, onDragEnd }: DndKitSortableProps ) => {
	const itemsKeys = items.map( ( item ) => item.key );

	const sensors = useSensors(
		useSensor( PointerSensor ),
		useSensor( KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		} )
	);

	const handleDragEnd = ( event ) => {
		const { active, over } = event;
		if ( active.id === over.id ) {
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
