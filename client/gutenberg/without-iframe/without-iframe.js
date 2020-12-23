/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import IsolatedBlockEditor from 'isolated-editor';

/**
 * Internal dependencies
 */
import { getSitePost } from 'calypso/state/posts/selectors';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryPosts from 'calypso/components/data/query-posts';
import EditorDocumentHead from 'calypso/post-editor/editor-document-head';
import './without-iframe.scss';
import PerformanceTrackerStop from 'calypso/lib/performance-tracking/performance-tracker-stop';
import { setCurrentSiteId } from './fix-api-fetch';

const getStatsPath = ( { postId } ) =>
	postId ? '/without-iframe/:post_type/:site/:post_id' : '/without-iframe/:post_type/:site';

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
	const { postId, siteId, post } = props;
	setCurrentSiteId( siteId );
	return (
		<>
			<PageViewTracker
				path={ getStatsPath( props ) }
				title={ getStatsTitle( props ) }
				properties={ getStatsProps( props ) }
			/>
			<EditorDocumentHead />
			<PerformanceTrackerStop />
			<QueryPosts siteId={ siteId } postId={ postId } query={ { context: 'edit' } } />

			{ post && (
				<IsolatedBlockEditor
					onLoad={ ( parse ) => parse( post.content ) }
					// eslint-disable-next-line no-console
					onError={ console.error }
					settings={ {} }
				/>
			) }
		</>
	);
}

export default connect( ( state, props ) => ( {
	post: getSitePost( state, props.siteId, props.postId ),
} ) )( Gutenberg );
