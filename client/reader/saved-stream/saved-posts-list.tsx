import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { getSavedPosts } from 'calypso/state/reader/saved/selectors';
import { SavedPostItem } from './saved-post-item';

export type SortOrder = 'newest' | 'oldest';

interface Props {
	sortOrder: SortOrder;
}

export function SavedPostsList( { sortOrder }: Props ) {
	const items = useSelector( getSavedPosts );

	const sortedItems = useMemo( () => {
		const copy = [ ...items ];
		copy.sort( ( a, b ) => {
			const aTime = new Date( a.savedAt ).getTime();
			const bTime = new Date( b.savedAt ).getTime();
			return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
		} );
		return copy;
	}, [ items, sortOrder ] );

	return (
		<div className="saved-posts-list">
			{ sortedItems.map( ( item ) => (
				<SavedPostItem
					key={ `${ item.postKey.blogId ?? item.postKey.feedId }-${ item.postKey.postId }` }
					item={ item }
				/>
			) ) }
		</div>
	);
}
