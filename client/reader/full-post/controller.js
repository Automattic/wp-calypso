/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import i18n from 'i18n-calypso';
import page from 'page';
import { defer } from 'lodash';

/**
 * Internal Dependencies
 */
import FeedError from 'reader/feed-error';
import {
	setPageTitle,
	trackPageLoad
} from 'reader/controller-helper';
import ReaderFullPost from 'blocks/reader-full-post';
import { renderWithReduxStore } from 'lib/react-helpers';

const analyticsPageTitle = 'Reader';

function renderPostNotFound() {
	const sidebarAndPageTitle = i18n.translate( 'Post not found' );

	setPageTitle( context, sidebarAndPageTitle );

	renderWithReduxStore(
		<FeedError sidebarTitle={ sidebarAndPageTitle } message={ i18n.translate( 'Post Not Found' ) } />,
		document.getElementById( 'primary' ),
		context.store
	);
}

export function blogPost( context ) {
	const blogId = context.params.blog,
		postId = context.params.post,
		basePath = '/read/blogs/:blog_id/posts/:post_id',
		fullPageTitle = analyticsPageTitle + ' > Blog Post > ' + blogId + ' > ' + postId;

	let referral;
	if ( context.query.ref_blog && context.query.ref_post ) {
		referral = { blogId: context.query.ref_blog, postId: context.query.ref_post };
	}
	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	ReactDom.render(
		React.createElement( ReduxProvider, { store: context.store },
			React.createElement( ReaderFullPost, {
				blogId: blogId,
				postId: postId,
				referral: referral,
				onClose: function() {
					page.back( context.lastRoute || '/' );
				},
				onPostNotFound: renderPostNotFound
			} )
		),
		document.getElementById( 'primary' )
	);
	defer( function() {
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	} );
}

export function feedPost( context ) {
	const feedId = context.params.feed,
		postId = context.params.post,
		basePath = '/read/feeds/:feed_id/posts/:feed_item_id',
		fullPageTitle = analyticsPageTitle + ' > Feed Post > ' + feedId + ' > ' + postId;

	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	function closer() {
		page.back( context.lastRoute || '/' );
	}

	ReactDom.render( (
		<ReduxProvider store={ context.store }>
			<ReaderFullPost
				feedId={ feedId }
				postId={ postId }
				onClose={ closer }
				onPostNotFound={ renderPostNotFound } />
		</ReduxProvider> ),
		document.getElementById( 'primary' )
	);
	defer( function() {
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	} );
}
