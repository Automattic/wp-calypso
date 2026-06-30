import AsyncLoad from 'calypso/components/async-load';
import { trackPageLoad } from 'calypso/reader/controller-helper';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

const loadReaderFullPost = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-reader-full-post" */ 'calypso/blocks/reader-full-post'
	);
const loadSidebar = () =>
	import( /* webpackChunkName: "async-load-calypso-reader-sidebar" */ 'calypso/reader/sidebar' );

const analyticsPageTitle = 'Reader';

const scrollTopIfNoHash = () =>
	setTimeout( () => {
		if ( typeof window !== 'undefined' && ! window.location.hash ) {
			window.scrollTo( 0, 0 );
		}
	}, 0 );

export function blogPost( context, next ) {
	const state = context.store.getState();
	const blogId = context.params.blog;
	const postId = context.params.post;
	const basePath = '/reader/blogs/:blog_id/posts/:post_id';
	const fullPageTitle = analyticsPageTitle + ' > Blog Post > ' + blogId + ' > ' + postId;

	let referral;
	if ( context.query.ref_blog && context.query.ref_post ) {
		referral = { blogId: context.query.ref_blog, postId: context.query.ref_post };
	}
	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	context.primary = (
		<AsyncLoad
			require={ loadReaderFullPost }
			blogId={ blogId }
			postId={ postId }
			referral={ referral }
		/>
	);

	if ( isUserLoggedIn( state ) ) {
		context.secondary = (
			<AsyncLoad require={ loadSidebar } path={ context.path } placeholder={ null } />
		);
	}
	scrollTopIfNoHash();
	next();
}

export function feedPost( context, next ) {
	const state = context.store.getState();
	const feedId = context.params.feed;
	const postId = context.params.post;
	const basePath = '/reader/feeds/:feed_id/posts/:feed_item_id';
	const fullPageTitle = analyticsPageTitle + ' > Feed Post > ' + feedId + ' > ' + postId;

	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	context.primary = (
		<AsyncLoad require={ loadReaderFullPost } feedId={ feedId } postId={ postId } />
	);

	if ( isUserLoggedIn( state ) ) {
		context.secondary = (
			<AsyncLoad require={ loadSidebar } path={ context.path } placeholder={ null } />
		);
	}

	scrollTopIfNoHash();
	next();
}
