/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * WordPress dependencies
 */
import { parse } from '@wordpress/blocks';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BrowserURL from './browser-url';
import EditorRestorePostDialog from 'post-editor/restore-post-dialog';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';
import getPostTypeTrashUrl from 'state/selectors/get-post-type-trash-url';

export class GutenlypsoLayout extends Component {
	loadRevision = revision => {
		const { post, updatePost, resetBlocks } = this.props;
		const { post_content: content, post_title: title, post_excerpt: excerpt } = revision;
		const postRevision = { ...post, content, title, excerpt };
		//update post does not automatically update content/blocks intentionally
		updatePost( postRevision );
		const blocks = parse( content );
		resetBlocks( blocks );
	};

	// @see https://github.com/Automattic/wp-calypso/blob/f1822838b984651bfc71ac26ee29ed13fcc86353/client/post-editor/post-editor.jsx#L557-L560
	navigateBack = () => page.back( this.props.trashUrl );

	restorePost = () => {
		this.props.editPost( { status: 'draft' } );
		this.props.savePost();
	};

	render() {
		const { isTrash } = this.props;

		return (
			<Fragment>
				<BrowserURL />
				{ isTrash && (
					<EditorRestorePostDialog onClose={ this.navigateBack } onRestore={ this.restorePost } />
				) }
				<EditorRevisionsDialog loadRevision={ this.loadRevision } />
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( select => {
		const { getCurrentPost, getCurrentPostType, getEditedPostAttribute } = select( 'core/editor' );
		return {
			post: getCurrentPost(),
			postType: getCurrentPostType(),
			isTrash: 'trash' === getEditedPostAttribute( 'status' ),
		};
	} ),
	withDispatch( dispatch => {
		const { editPost, savePost, updatePost, resetBlocks } = dispatch( 'core/editor' );
		return {
			editPost,
			savePost,
			updatePost,
			resetBlocks,
		};
	} ),
	connect( ( state, { postType } ) => ( {
		trashUrl: getPostTypeTrashUrl( state, postType ),
	} ) ),
] )( GutenlypsoLayout );
