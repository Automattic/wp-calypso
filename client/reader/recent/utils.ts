import { isPaddingStreamItem, type StreamListItem } from 'calypso/reader/data/stream';

// `postId` is not unique across feeds/blogs; prefix with `b{blogId}` for
// WP.com/Jetpack sites or `f{feedId}` for external feeds so row keys stay unique.
export const getStreamItemKey = ( item: StreamListItem ): string => {
	if ( isPaddingStreamItem( item ) ) {
		return item.postId;
	}
	if ( item.postId == null ) {
		return '';
	}
	const source = item.blogId != null ? `b${ item.blogId }` : `f${ item.feedId ?? '' }`;
	return `${ source }-${ item.postId }`;
};
