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
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDispatch, useSelector } from 'calypso/state';
import { reorderSavedPosts } from 'calypso/state/reader/saved/actions';
import { getSavedPosts } from 'calypso/state/reader/saved/selectors';
import { SavedPostItem } from './saved-post-item';
import type { DragEndEvent } from '@dnd-kit/core';

export function SavedPostsList() {
	const dispatch = useDispatch();
	const items = useSelector( getSavedPosts );

	const sensors = useSensors(
		useSensor( PointerSensor ),
		useSensor( KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		} )
	);

	function handleDragEnd( event: DragEndEvent ) {
		const { active, over } = event;
		if ( ! over || active.id === over.id ) {
			return;
		}

		const oldIndex = items.findIndex(
			( item ) =>
				`${ item.postKey.blogId ?? item.postKey.feedId }-${ item.postKey.postId }` === active.id
		);
		const newIndex = items.findIndex(
			( item ) =>
				`${ item.postKey.blogId ?? item.postKey.feedId }-${ item.postKey.postId }` === over.id
		);

		if ( oldIndex !== -1 && newIndex !== -1 ) {
			dispatch( reorderSavedPosts( oldIndex, newIndex ) );
		}
	}

	const sortableIds = items.map(
		( item ) => `${ item.postKey.blogId ?? item.postKey.feedId }-${ item.postKey.postId }`
	);

	return (
		<DndContext
			sensors={ sensors }
			collisionDetection={ closestCenter }
			onDragEnd={ handleDragEnd }
		>
			<SortableContext items={ sortableIds } strategy={ verticalListSortingStrategy }>
				<div className="saved-posts-list">
					{ items.map( ( item ) => (
						<SavedPostItem
							key={ `${ item.postKey.blogId ?? item.postKey.feedId }-${ item.postKey.postId }` }
							item={ item }
						/>
					) ) }
				</div>
			</SortableContext>
		</DndContext>
	);
}
