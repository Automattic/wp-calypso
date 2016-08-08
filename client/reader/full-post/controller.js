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
import TitleStore from 'lib/screen-title/store';
import {
	setPageTitle,
	trackPageLoad
} from 'reader/controller-helper';
import titleActions from 'lib/screen-title/actions';
import FullPostDialog from './main';
import ReaderFullPost from 'components/reader-full-post';

const analyticsPageTitle = 'Reader';
// This holds the last title set on the page. Removing the overlay doesn't trigger a re-render, so we need a way to
// reset it
let __lastTitle = null;

function renderPostNotFound() {
	const sidebarAndPageTitle = i18n.translate( 'Post not found' );

	setPageTitle( sidebarAndPageTitle );

	ReactDom.render(
		<FeedError sidebarTitle={ sidebarAndPageTitle } message={ i18n.translate( 'Post Not Found' ) } />,
		document.getElementById( 'primary' )
	);
}

function removeFullPostDialog() {
	ReactDom.unmountComponentAtNode( document.getElementById( 'tertiary' ) );
}

export function resetTitle( context, next ) {
	if ( __lastTitle ) {
		titleActions.setTitle( __lastTitle );
		__lastTitle = null;
	}
	next();
}

export function blogPost( context ) {
	const blogId = context.params.blog,
		postId = context.params.post,
		basePath = '/read/blogs/:blog_id/posts/:post_id',
		fullPageTitle = analyticsPageTitle + ' > Blog Post > ' + blogId + ' > ' + postId;

	__lastTitle = TitleStore.getState().title;

	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	// this will automatically unmount anything that was already mounted
	// in #tertiary, so we don't have to check the current state
	ReactDom.render(
		React.createElement( ReduxProvider, { store: context.store },
			React.createElement( FullPostDialog, {
				blogId: blogId,
				postId: postId,
				context: context,
				setPageTitle: setPageTitle,
				onClose: function() {
					page.back( context.lastRoute || '/' );
				},
				onClosed: removeFullPostDialog,
				onPostNotFound: renderPostNotFound
			} )
		),
		document.getElementById( 'tertiary' )
	);
}

export function blogPostNew( context ) {
	var blogId = context.params.blog,
		postId = context.params.post,
		basePath = '/read/blogs/:blog_id/posts/:post_id',
		fullPageTitle = analyticsPageTitle + ' > Blog Post > ' + blogId + ' > ' + postId;

	__lastTitle = TitleStore.getState().title;

	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	ReactDom.render(
		React.createElement( ReduxProvider, { store: context.store },
			React.createElement( ReaderFullPost, {
				blogId: blogId,
				postId: postId,
				context: context,
				setPageTitle: setPageTitle,
				onClose: function() {
					page.back( context.lastRoute || '/' );
				},
				onClosed: removeFullPostDialog,
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

	__lastTitle = TitleStore.getState().title;

	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	// this will automatically unmount anything that was already mounted
	// in #tertiary, so we don't have to check the current state of
	// __fullPostInstance before making another
	ReactDom.render(
		React.createElement( ReduxProvider, { store: context.store },
			React.createElement( FullPostDialog, {
				feedId: feedId,
				postId: postId,
				setPageTitle: setPageTitle,
				onClose: function() {
					page.back( context.lastRoute || '/' );
				},
				onClosed: removeFullPostDialog,
				onPostNotFound: renderPostNotFound
			} )
		),
		document.getElementById( 'tertiary' )
	);
}

export function feedPostNew( context ) {
	var feedId = context.params.feed,
		postId = context.params.post,
		basePath = '/read/feeds/:feed_id/posts/:feed_item_id',
		fullPageTitle = analyticsPageTitle + ' > Feed Post > ' + feedId + ' > ' + postId;

	__lastTitle = TitleStore.getState().title;

	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	function closer() {
		page.back( context.lastRoute || '/' );
	}

	ReactDom.render( (
		<ReduxProvider store={ context.store }>
			<ReaderFullPost
				feedId={ feedId }
				postId={ postId }
				setPageTitle={ setPageTitle }
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
