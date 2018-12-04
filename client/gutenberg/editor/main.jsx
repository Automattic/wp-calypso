/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Editor from './edit-post/editor.js';
import EditorDocumentHead from './editor-document-head';
import EditorPostTypeUnsupported from 'post-editor/editor-post-type-unsupported';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryPostTypes from 'components/data/query-post-types';
import { createAutoDraft, requestSitePost, requestGutenbergDemoContent } from 'state/data-getters';
import { getHttpData } from 'state/data-layer/http-data';
import { translate } from 'i18n-calypso';
import './hooks'; // Needed for integrating Calypso's media library (and other hooks)
import isRtlSelector from 'state/selectors/is-rtl';

/**
 * Style dependencies
 */
import './style.scss';

class GutenbergEditor extends Component {
	componentDidMount() {
		const { siteId, postId, uniqueDraftKey, postType } = this.props;
		if ( ! postId ) {
			createAutoDraft( siteId, uniqueDraftKey, postType );
		}
	}

	getAnalyticsPathAndTitle = () => {
		const { postId, postType } = this.props;
		const isPost = 'post' === postType;
		const isPage = 'page' === postType;
		const isNew = ! postId;
		const isEdit = !! postId;
		if ( isPost && isNew ) {
			return { path: '/block-editor/post/:site', title: 'Post > New' };
		}
		if ( isPost && isEdit ) {
			return { path: '/block-editor/post/:site/:post_id', title: 'Post > Edit' };
		}
		if ( isPage && isNew ) {
			return { path: '/block-editor/page/:site', title: 'Page > New' };
		}
		if ( isPage && isEdit ) {
			return { path: '/block-editor/page/:site/:post_id', title: 'Page > Edit' };
		}
		if ( isNew ) {
			return { path: `/block-editor/edit/${ postType }/:site`, title: 'Custom Post Type > New' };
		}
		if ( isEdit ) {
			return {
				path: `/block-editor/edit/${ postType }/:site/:post_id`,
				title: 'Custom Post Type > Edit',
			};
		}
	};

	render() {
		const { postType, siteId, post, overridePost, isRTL } = this.props;

		//see also https://github.com/WordPress/gutenberg/blob/45bc8e4991d408bca8e87cba868e0872f742230b/lib/client-assets.php#L1451
		const editorSettings = {
			autosaveInterval: 3, //interval to debounce autosaving events, in seconds.
			titlePlaceholder: translate( 'Add title' ),
			bodyPlaceholder: translate( 'Write your story' ),
			postLock: {},
			isRTL,
		};

		return (
			<Fragment>
				<QueryPostTypes siteId={ siteId } />
				<PageViewTracker { ...this.getAnalyticsPathAndTitle() } />
				<EditorPostTypeUnsupported type={ postType } />
				<EditorDocumentHead postType={ postType } />
				<Editor
					settings={ editorSettings }
					hasFixedToolbar={ true }
					post={ post }
					onError={ noop }
					overridePost={ overridePost }
				/>
			</Fragment>
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
	const isRTL = isRtlSelector( state );

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
		post,
		overridePost,
		isRTL,
	};
};

export default connect( mapStateToProps )( GutenbergEditor );
