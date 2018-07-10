/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';

function PostTrashCheck( { isNew, postId, children } ) {
	if ( isNew || ! postId ) {
		return null;
	}

	return children;
}

export default withSelect( ( select ) => {
	const { isEditedPostNew, getCurrentPostId } = select( 'core/editor' );
	return {
		isNew: isEditedPostNew(),
		postId: getCurrentPostId(),
	};
} )( PostTrashCheck );
