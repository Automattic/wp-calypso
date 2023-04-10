import IsoloatedEditor, { ToolbarSlot } from '@automattic/isolated-block-editor';
import { serialize } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { select, useDispatch } from '@wordpress/data';
import { mediaUpload } from '@wordpress/editor';
import { useEffect } from '@wordpress/element';
import { addFilter, removeFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { MediaUpload } from '@wordpress/media-utils';
import { useSelector, useDispatch as useReduxDispatch } from 'react-redux';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import useCreateNewPost from './use-create-new-post';
import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: 'reader-post-editor-create-post-notice',
	isDismissible: true,
};

function ReaderPostEditor() {
	const dispatch = useDispatch();

	// Use global redux store for Calypso state and actions
	const reduxDispatch = useReduxDispatch();
	const primarySiteId = useSelector( getPrimarySiteId );

	const { createNewPost, isLoading } = useCreateNewPost( {
		onSuccess: () => {
			reduxDispatch( successNotice( __( 'Post published!' ), noticeOptions ) );
			dispatch( 'core/block-editor' ).resetBlocks( [] );
		},
		onError: ( error ) => {
			const errorMessage = error?.message || __( 'Something went wrong, please try again.' );
			reduxDispatch( errorNotice( errorMessage, noticeOptions ) );
		},
	} );

	useEffect( () => {
		addFilter( 'editor.MediaUpload', 'wp-calypso/media-upload', () => MediaUpload );

		return removeFilter( 'editor.MediaUpload', 'wp-calypso/media-upload' );
	}, [] );

	const editorSettings = {
		iso: {
			moreMenu: false,
			footer: true,
		},
		editor: {
			bodyPlaceholder: __( "What's on your mind?" ),
			hasFixedToolbar: true,
			mediaUpload,
		},
	};

	function publishPost() {
		const blocks = select( 'core/block-editor' ).getBlocks();

		if ( blocks && blocks.length > 0 ) {
			createNewPost( primarySiteId, {
				content: serialize( blocks ),
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
							disabled={ isLoading }
						>
							{ isLoading ? __( 'Publishing…' ) : __( 'Publish' ) }
						</Button>
					</ToolbarSlot>
				</IsoloatedEditor>
			</div>
		</div>
	);
}

export default ReaderPostEditor;
