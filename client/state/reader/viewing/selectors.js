/**
 * Internal dependencies
 */
import 'state/reader/init';

/**
 * Get the blog id that is currently viewed by the user in full post page
 *
 * @param state redux state
 * @returns {number} blog Id or null
 */
export function getViewingFullPostBlogId( state ) {
	return state.reader.viewing.fullPost;
}

/**
 * Get a list of blog ids that are currently viewed by the user in reader feeds or full post page
 *
 * @param state redux state
 * @returns {[]} list of blog ids that are currently viewed
 */
export function getViewingBlogIds( state ) {
	const viewingBlogs = state.reader.viewing;
	const blogIds = [];

	if ( viewingBlogs.feed ) {
		for ( const blogId in viewingBlogs.list ) {
			if ( viewingBlogs.list[ blogId ].length > 0 ) {
				blogIds.push( parseInt( blogId ) );
			}
		}
	}

	if ( viewingBlogs.fullPost ) {
		blogIds.push( parseInt( viewingBlogs.fullPost ) );
	}

	return blogIds;
}
