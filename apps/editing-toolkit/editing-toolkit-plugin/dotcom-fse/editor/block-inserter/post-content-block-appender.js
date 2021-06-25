/**
 * External dependencies
 */
import { Inserter } from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

const PostContentBlockAppender = compose(
	withSelect( ( select ) => {
		const { getEditorSettings } = select( 'core/editor' );
		const { getBlocks } = select( 'core/block-editor' );
		const { getEditorMode } = select( 'core/edit-post' );

		const postContentBlock = getBlocks().find( ( block ) => block.name === 'a8c/post-content' );

		return {
			rootClientId: postContentBlock ? postContentBlock.clientId : '',
			showInserter: getEditorMode() === 'visual' && getEditorSettings().richEditingEnabled,
		};
	} )
)( ( { rootClientId, showInserter } ) => {
	const inserterToggleProps = { isPrimary: true };
	return (
		<Inserter
			rootClientId={ rootClientId }
			disabled={ ! showInserter }
			position="bottom right"
			toggleProps={ inserterToggleProps }
		/>
	);
} );

export default PostContentBlockAppender;
