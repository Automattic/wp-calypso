/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';

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
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';

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

	render() {
		return (
			<Fragment>
				<BrowserURL />
				<EditorRevisionsDialog loadRevision={ this.loadRevision } />
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( select => {
		const { getCurrentPost } = select( 'core/editor' );
		return {
			post: getCurrentPost(),
		};
	} ),
	withDispatch( dispatch => {
		const { updatePost, resetBlocks } = dispatch( 'core/editor' );
		return {
			updatePost,
			resetBlocks,
		};
	} ),
] )( GutenlypsoLayout );
