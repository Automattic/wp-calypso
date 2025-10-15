import { addQueryArgs, getSiteFragment } from 'calypso/lib/route';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { stopEditingPost } from 'calypso/state/editor/actions';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function determinePostType( context ) {
	if ( context.path.startsWith( '/post/' ) ) {
		return 'post';
	}
	if ( context.path.startsWith( '/page/' ) ) {
		return 'page';
	}

	return context.params.customPostType;
}

function getPostID( context ) {
	if ( ! context.params.post || 'new' === context.params.post ) {
		return null;
	}

	if ( 'home' === context.params.post ) {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );

		return parseInt( getSiteOption( state, siteId, 'page_on_front' ), 10 );
	}

	// both post and site are in the path
	return parseInt( context.params.post, 10 );
}

export const redirect = async ( context ) => {
	const {
		store: { getState },
	} = context;

	const state = getState();
	const siteId = getSelectedSiteId( state );
	const postType = determinePostType( context );
	const postId = getPostID( context );

	const url = postType
		? getEditorUrl( state, siteId, postId, postType )
		: getSiteEditorUrl( state, siteId );
	// pass along parameters, for example press-this
	return window.location.replace( addQueryArgs( context.query, url ) );
};

export const exitPost = ( context, next ) => {
	const postId = getPostID( context );
	const siteId = getSelectedSiteId( context.store.getState() );
	if ( siteId ) {
		context.store.dispatch( stopEditingPost( siteId, postId ) );
	}
	next();
};

/**
 * Redirects to the un-iframed Site Editor if the config is enabled.
 * @param {Object} context Shared context in the route.
 * @returns {*}            Whatever the next callback returns.
 */
export const redirectSiteEditor = async ( context ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const siteEditorUrl = getSiteEditorUrl( state, siteId );
	// Calling replace to avoid adding an entry to the browser history upon redirect.
	return window.location.replace( addQueryArgs( context.query, siteEditorUrl ) );
};
/**
 * Redirect the logged user to the permalink of the post, page, custom post type if the post is published.
 * @param {Object} context Shared context in the route.
 * @param {Function} next  Next registered callback for the route.
 * @returns undefined      Whatever the next callback returns.
 */
export function redirectToPermalinkIfLoggedOut( context, next ) {
	if ( isUserLoggedIn( context.store.getState() ) ) {
		return next();
	}
	const siteFragment = context.params.site || getSiteFragment( context.path );
	if ( ! siteFragment || ! context.path ) {
		return next();
	}
	// "single view" pages are parsed from URLs like these:
	// (posts, pages, custom post types, etc…)
	//  - /page/{site}/{post_id}
	//  - /post/{site}/{post_id}
	//  - /edit/jetpack-portfolio/{site}/{post_id}
	//  - /edit/jetpack-testimonial/{site}/{post_id}
	const postId = parseInt( context.params.post, 10 );
	const linksToSingleView = postId > 0;
	if ( linksToSingleView ) {
		// Redirect the logged user to the permalink of the post, page, custom post type if the post is published.
		window.location = `https://public-api.wordpress.com/wpcom/v2/sites/${ siteFragment }/editor/redirect?path=${ context.path }`;
		return;
	}
	// Else redirect the user to the login page.
	return next();
}
