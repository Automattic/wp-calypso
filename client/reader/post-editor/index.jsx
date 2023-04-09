import IsoloatedEditor, { ToolbarSlot } from '@automattic/isolated-block-editor';
import { serialize } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import useCreateNewPost from './use-create-new-post';
import './style.scss';

function ReaderPostEditor() {
	const { createNewPost } = useCreateNewPost();
	const primarySiteId = useSelector( getPrimarySiteId );

	const editorSettings = {
		iso: {
			moreMenu: false,
			footer: true,
		},
		editor: {
			bodyPlaceholder: __( "What's on your mind?" ),
			hasFixedToolbar: true,
		},
	};

	function getSerializedBlocks() {
		const blocks = select( 'core/block-editor' ).getBlocks();

		if ( blocks ) {
			return serialize( blocks );
		}

		return null;
	}

	function publishPost() {
		const blocksHtml = getSerializedBlocks();

		if ( blocksHtml ) {
			createNewPost( primarySiteId, {
				content: blocksHtml,
			} );
		}
	}

	return (
		<div className="reader-post-editor">
			<div className="reader-post-editor__editor">
				<IsoloatedEditor settings={ editorSettings }>
					<ToolbarSlot>
						<Button
							className="reader-post-editor__publish-button"
							isPrimary="true"
							onClick={ publishPost }
						>
							{ __( 'Publish' ) }
						</Button>
					</ToolbarSlot>
				</IsoloatedEditor>
			</div>
		</div>
	);
}

export default ReaderPostEditor;
