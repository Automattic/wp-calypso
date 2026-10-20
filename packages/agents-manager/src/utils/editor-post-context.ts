import { select } from '@wordpress/data';

type EditorSelectors = { getCurrentPostId?: () => number | string | null };

/**
 * The post the editor has open, for the client context: `current_page_id` in
 * any editor and, on `post.php`, the post as an entity.
 */
export function getEditorPostContext(): Record< string, unknown > {
	const postId = ( select( 'core/editor' ) as EditorSelectors | undefined )?.getCurrentPostId?.();

	if ( ! postId ) {
		return {};
	}

	return {
		current_page_id: postId,
		...( window.location.pathname.includes( '/wp-admin/post.php' ) && {
			id: 'post',
			type: 'entity',
			entityType: 'post',
			entityId: String( postId ),
		} ),
	};
}
