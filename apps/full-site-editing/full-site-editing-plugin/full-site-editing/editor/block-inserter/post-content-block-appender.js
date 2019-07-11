/**
 * External dependencies
 */
import { Inserter } from '@wordpress/editor';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

const PostContentBlockAppender = compose(
	withSelect( select => {
		const { getBlocks, getEditorSettings } = select( 'core/editor' );
		const { getEditorMode } = select( 'core/edit-post' );

		const postContentBlock = getBlocks().find( block => block.name === 'a8c/post-content' );

		return {
			rootClientId: postContentBlock ? postContentBlock.clientId : '',
			showInserter: getEditorMode() === 'visual' && getEditorSettings().richEditingEnabled,
		};
	} )
)( ( { rootClientId, showInserter } ) => {
	return (
		<Inserter rootClientId={ rootClientId } disabled={ ! showInserter } position="bottom right" />
	);
} );

export default PostContentBlockAppender;
