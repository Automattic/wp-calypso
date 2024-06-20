import page from '@automattic/calypso-router';
import { defer } from 'lodash';
import AsyncLoad from 'calypso/components/async-load';
import { trackPageLoad } from 'calypso/reader/controller-helper';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

const analyticsPageTitle = 'Reader';

const scrollTopIfNoHash = () =>
	defer( () => {
		if ( typeof window !== 'undefined' && ! window.location.hash ) {
			window.scrollTo( 0, 0 );
		}
	} );

export function blogPost( context, next ) {
	const state = context.store.getState();
	const blogId = context.params.blog;
	const postId = context.params.post;
	const basePath = '/read/blogs/:blog_id/posts/:post_id';
	const fullPageTitle = analyticsPageTitle + ' > Blog Post > ' + blogId + ' > ' + postId;

	let referral;
	if ( context.query.ref_blog && context.query.ref_post ) {
		referral = { blogId: context.query.ref_blog, postId: context.query.ref_post };
	}
	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	const lastRoute = context.lastRoute || '/';
	function closer() {
		page.back( lastRoute );
	}

	context.primary = (
		<AsyncLoad
			require="calypso/blocks/reader-full-post"
			blogId={ blogId }
			postId={ postId }
			referral={ referral }
			referralStream={ context.lastRoute }
			onClose={ closer }
		/>
	);

	if ( isUserLoggedIn( state ) ) {
		context.secondary = (
			<AsyncLoad
				require="calypso/reader/sidebar"
				path={ context.path }
				placeholder={ null }
				returnPath={ lastRoute }
				onClose={ closer }
			/>
		);
	}
	scrollTopIfNoHash();
	next();
}

export function feedPost( context, next ) {
	const state = context.store.getState();
	const feedId = context.params.feed;
	const postId = context.params.post;
	const basePath = '/read/feeds/:feed_id/posts/:feed_item_id';
	const fullPageTitle = analyticsPageTitle + ' > Feed Post > ' + feedId + ' > ' + postId;

	trackPageLoad( basePath, fullPageTitle, 'full_post' );

	const lastRoute = context.lastRoute || '/';
	function closer() {
		page.back( lastRoute );
	}

	context.primary = (
		<AsyncLoad
			require="calypso/blocks/reader-full-post"
			feedId={ feedId }
			postId={ postId }
			onClose={ closer }
			referralStream={ context.lastRoute }
		/>
	);

	if ( isUserLoggedIn( state ) ) {
		context.secondary = (
			<AsyncLoad
				require="calypso/reader/sidebar"
				path={ context.path }
				placeholder={ null }
				returnPath={ lastRoute }
				onClose={ closer }
			/>
		);
	}

	scrollTopIfNoHash();
	next();
}
