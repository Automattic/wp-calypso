/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Dashicon } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

function PostTrash( { isNew, postId, postType, ...props } ) {
	if ( isNew || ! postId ) {
		return null;
	}

	const onClick = () => props.trashPost( postId, postType );

	return (
		<Button isLink className="editor-post-trash button-link-delete" onClick={ onClick }>
			{ __( 'Move to trash' ) }
			<Dashicon icon="trash" />
		</Button>
	);
}

export default compose( [
	withSelect( ( select ) => {
		const {
			isEditedPostNew,
			getCurrentPostId,
			getCurrentPostType,
		} = select( 'core/editor' );
		return {
			isNew: isEditedPostNew(),
			postId: getCurrentPostId(),
			postType: getCurrentPostType(),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		trashPost: dispatch( 'core/editor' ).trashPost,
	} ) ),
] )( PostTrash );
