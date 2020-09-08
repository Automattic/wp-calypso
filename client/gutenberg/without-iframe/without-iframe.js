/**
 * External dependencies
 */
import React, { useEffect } from 'react';

// A hack to make React available for non-transpiled components imported by `wp/edit-post`
window.React = React;

/**
 * WordPress dependencies
 */
import '@wordpress/core-data';
import '@wordpress/viewport';
import '@wordpress/notices';
import '@wordpress/edit-post';

import { registerCoreBlocks } from '@wordpress/block-library';
import '@wordpress/format-library';
import { useDispatch, useSelect } from '@wordpress/data';

import '@wordpress/components/build-style/style.css';
import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/block-library/build-style/editor.css';
import '@wordpress/block-library/build-style/theme.css';
import '@wordpress/format-library/build-style/style.css';

/**
 * Internal dependencies
 */
import PageViewTracker from 'lib/analytics/page-view-tracker';
import EditorDocumentHead from 'post-editor/editor-document-head';
import './without-iframe.scss';
import PerformanceTrackerStop from 'lib/performance-tracking/performance-tracker-stop';
import Editor from '@wordpress/edit-post/src/editor';
import { setCurrentSiteId } from './fix-api-fetch';

registerCoreBlocks();

const getStatsPath = ( { postId } ) =>
	postId
		? '/block-editor/without-iframe/:post_type/:site/:post_id'
		: '/block-editor/without-iframe/:post_type/:site';

const getStatsTitle = ( { postId, postType } ) => {
	let postTypeText;

	switch ( postType ) {
		case 'post':
			postTypeText = 'Post';
			break;
		case 'page':
			postTypeText = 'Page';
			break;
		default:
			postTypeText = 'Custom Post Type';
			break;
	}

	return postId
		? `Block Editor > ${ postTypeText } > Edit`
		: `Block Editor > ${ postTypeText } > New`;
};

const getStatsProps = ( { postId, postType } ) =>
	postId ? { post_type: postType, post_id: postId } : { post_type: postType };

function Gutenberg( props ) {
	const { postId, siteId, postType } = props;

	setCurrentSiteId( siteId );

	const { toggleFeature } = useDispatch( 'core/edit-post' );
	const isFullscreenActive = useSelect( ( select ) =>
		select( 'core/edit-post' ).isFeatureActive( 'fullscreenMode' )
	);

	useEffect( () => {
		if ( isFullscreenActive ) {
			// toggle fullscreen off by default
			toggleFeature( 'fullscreenMode' );
		}
	}, [ toggleFeature, isFullscreenActive ] );

	return (
		<>
			<PageViewTracker
				path={ getStatsPath( props ) }
				title={ getStatsTitle( props ) }
				properties={ getStatsProps( props ) }
			/>
			<EditorDocumentHead />
			<PerformanceTrackerStop />

			<div className="editor__without-iframe" role="main">
				<Editor
					postId={ postId }
					postType={ postType }
					settings={ {
						__experimentalBlockPatternCategories: [],
						__experimentalBlockPatterns: [],
					} }
				/>
			</div>
		</>
	);
}

export default Gutenberg;
