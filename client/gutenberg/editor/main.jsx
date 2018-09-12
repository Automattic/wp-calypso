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
import { requestGutenbergDraftPost as requestDraftId, requestSitePost } from 'state/data-getters';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { WithAPIMiddleware } from './api-middleware/utils';

const editorSettings = {};

class GutenbergEditor extends Component {
	componentDidMount() {
		registerCoreBlocks();
		// Prevent Guided tour from showing when editor loads.
		dispatch( 'core/nux' ).disableTips();
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

const mapStateToProps = ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	let { postId } = ownProps;

	if ( ! postId ) {
		const requestDraftIdData = requestDraftId( siteId );
		postId = get( requestDraftIdData, 'data.ID' );
	}

	const requestSitePostData = requestSitePost( siteId, postId );

	return {
		siteSlug: getSiteSlug( state, siteId ),
		post: get( requestSitePostData, 'data', null ),
	};
};

export default connect( mapStateToProps )( GutenbergEditor );
