import IsoloatedEditor, { FooterSlot } from '@automattic/isolated-block-editor';
import { serialize } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { select, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch as useReduxDispatch } from 'react-redux';
import SitesDropdown from 'calypso/components/sites-dropdown';
import useCreateNewPost from 'calypso/data/posts/use-create-new-post';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import PostFormatSelector from './post-format-selector';
import '@automattic/isolated-block-editor/build-browser/core.css';
import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: 'reader-post-editor-create-post-notice',
	isDismissible: true,
};

function ReaderPostEditor() {
	const dispatch = useDispatch();
	const translate = useTranslate();

	// Use global redux store for Calypso state and actions
	const reduxDispatch = useReduxDispatch();
	const primarySiteId = useSelector( getPrimarySiteId );
	const [ siteId, setSiteId ] = useState( primarySiteId );

	const { createNewPost, isLoading } = useCreateNewPost( {
		onSuccess: () => {
			reduxDispatch( successNotice( translate( 'Post published!' ), noticeOptions ) );
			dispatch( 'core/block-editor' ).resetBlocks( [] );
		},
		onError: ( error ) => {
			const errorMessage = error?.message || translate( 'Something went wrong, please try again.' );
			reduxDispatch( errorNotice( errorMessage, noticeOptions ) );
		},
	} );

	const editorSettings = {
		iso: {
			footer: true,
			header: false,
			moreMenu: false,
		},
		editor: {
			bodyPlaceholder: translate( "What's on your mind?" ),
			hasFixedToolbar: true,
		},
	};

	function publishPost() {
		const blocks = select( 'core/block-editor' ).getBlocks();

		if ( blocks && blocks.length > 0 ) {
			createNewPost( siteId, {
				content: serialize( blocks ),
			} );
		}
	}

	return (
		<div className="reader-post-editor">
			<SitesDropdown compact={ true } selectedSiteId={ siteId } onSiteSelect={ setSiteId } />
			<div className="reader-post-editor__editor">
				<IsoloatedEditor settings={ editorSettings }>
					<FooterSlot>
						<PostFormatSelector />
						<Button
							className="reader-post-editor__publish-button"
							isPrimary
							onClick={ publishPost }
							disabled={ isLoading }
						>
							{ isLoading ? translate( 'Posting…' ) : translate( 'Post' ) }
						</Button>
					</FooterSlot>
				</IsoloatedEditor>
			</div>
		</div>
	);
}

export default ReaderPostEditor;
