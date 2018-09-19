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

/**
 * Internal dependencies
 */
import Editor from './edit-post/editor.js';
import EditorPostTypeUnsupported from 'post-editor/editor-post-type-unsupported';
import QueryPostTypes from 'components/data/query-post-types';
import { requestGutenbergDraftPost as createAutoDraft, requestSitePost } from 'state/data-getters';
import { getHttpData } from 'state/data-layer/http-data';
import { getSiteSlug } from 'state/sites/selectors';
import { WithAPIMiddleware } from './api-middleware/utils';
import { translate } from 'i18n-calypso';

const editorSettings = {
	autosaveInterval: 3, //interval to debounce autosaving events, in seconds.
};

class GutenbergEditor extends Component {
	componentDidMount() {
		registerCoreBlocks();
		// Prevent Guided tour from showing when editor loads.
		dispatch( 'core/nux' ).disableTips();

		const { siteId, postId, uniqueDraftKey } = this.props;
		if ( ! postId ) {
			createAutoDraft( siteId, uniqueDraftKey );
		}
	}

	render() {
		const { postType, siteId, siteSlug, post } = this.props;

		return (
			<WithAPIMiddleware siteSlug={ siteSlug }>
				<QueryPostTypes siteId={ siteId } />
				<EditorPostTypeUnsupported type={ postType } />
				<Editor
					settings={ editorSettings }
					hasFixedToolbar={ true }
					post={ post }
					onError={ noop }
				/>
			</WithAPIMiddleware>
		);
	}
}

const addGutenbergDemoContent = post => {
	const title = {
		raw: translate( 'Welcome to the Gutenberg Editor' ),
		rendered: translate( 'Welcome to the Gutenberg Editor' ),
	};

	return {
		...post,
		title,
	};
};

const getPost = ( siteId, postId ) => {
	if ( ! siteId || ! postId ) {
		return null;
	}

	const sitePostData = get( requestSitePost( siteId, postId ), 'data', null );
	return sitePostData && 'auto-draft' === sitePostData.status
		? addGutenbergDemoContent( sitePostData )
		: sitePostData;
};

const mapStateToProps = ( state, { siteId, postId, uniqueDraftKey } ) => {
	const draftPostId = get( getHttpData( uniqueDraftKey ), 'data.ID', null );
	const post = getPost( siteId, postId || draftPostId );

	return {
		siteSlug: getSiteSlug( state, siteId ),
		post,
	};
};

export default connect( mapStateToProps )( GutenbergEditor );
