/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, noop } from 'lodash';
import { dispatch } from '@wordpress/data';
import '@wordpress/core-data'; // Initializes core data store
import { registerCoreBlocks } from '@wordpress/block-library';
import { setFreeformContentHandlerName } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import Editor from './edit-post/editor.js';
import EditorDocumentHead from './editor-document-head';
import EditorPostTypeUnsupported from 'post-editor/editor-post-type-unsupported';
import QueryPostTypes from 'components/data/query-post-types';
import { createAutoDraft, requestSitePost, requestGutenbergDemoContent } from 'state/data-getters';
import { getHttpData } from 'state/data-layer/http-data';
import { getSiteSlug } from 'state/sites/selectors';
import { WithAPIMiddleware } from './api-middleware/utils';
import { translate } from 'i18n-calypso';
import 'tinymce/plugins/lists/plugin.js'; // Make list indent/outdent work
import './hooks'; // Needed for integrating Calypso's media library (and other hooks)
import { removeUnsupportedCoreBlocks } from './setup';
import '../extensions/classic-block/editor';

class GutenbergEditor extends Component {
	componentDidMount() {
		registerCoreBlocks();
		// Prevent Guided tour from showing when editor loads.
		dispatch( 'core/nux' ).disableTips();

		// Handle posts that were created with classic editor
		setFreeformContentHandlerName( 'a8c/classic' );

		removeUnsupportedCoreBlocks();

		const { siteId, postId, uniqueDraftKey, postType } = this.props;
		if ( ! postId ) {
			createAutoDraft( siteId, uniqueDraftKey, postType );
		}
	}

	render() {
		const { postType, siteId, siteSlug, post, overridePost } = this.props;

		//see also https://github.com/WordPress/gutenberg/blob/45bc8e4991d408bca8e87cba868e0872f742230b/lib/client-assets.php#L1451
		const editorSettings = {
			autosaveInterval: 3, //interval to debounce autosaving events, in seconds.
			titlePlaceholder: translate( 'Add title' ),
			bodyPlaceholder: translate( 'Write your story' ),
			postLock: {},
		};

		return (
			<WithAPIMiddleware siteSlug={ siteSlug }>
				<QueryPostTypes siteId={ siteId } />
				<EditorPostTypeUnsupported type={ postType } />
				<EditorDocumentHead postType={ postType } />
				<Editor
					settings={ editorSettings }
					hasFixedToolbar={ true }
					post={ post }
					onError={ noop }
					overridePost={ overridePost }
				/>
			</WithAPIMiddleware>
		);
	}
}

const getPost = ( siteId, postId, postType ) => {
	if ( siteId && postId && postType ) {
		const requestSitePostData = requestSitePost( siteId, postId, postType );
		return get( requestSitePostData, 'data', null );
	}

	return null;
};

const mapStateToProps = ( state, { siteId, postId, uniqueDraftKey, postType, isDemoContent } ) => {
	const draftPostId = get( getHttpData( uniqueDraftKey ), 'data.ID', null );
	const post = getPost( siteId, postId || draftPostId, postType );
	const demoContent = isDemoContent ? get( requestGutenbergDemoContent(), 'data' ) : null;
	const isAutoDraft = 'auto-draft' === get( post, 'status', null );

	let overridePost = null;
	if ( !! demoContent ) {
		overridePost = {
			title: demoContent.title.raw,
			content: demoContent.content,
		};
	} else if ( isAutoDraft ) {
		overridePost = { title: '' };
	}

	return {
		siteSlug: getSiteSlug( state, siteId ),
		post,
		overridePost,
	};
};

export default connect( mapStateToProps )( GutenbergEditor );
