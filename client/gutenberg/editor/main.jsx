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

const editorSettings = {};

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

const getPost = ( siteId, postId ) => {
	if ( siteId && postId ) {
		const requestSitePostData = requestSitePost( siteId, postId );
		return get( requestSitePostData, 'data', null );
	}

	return null;
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
