import { isEnabled } from '@automattic/calypso-config';
import { makeLayout, render } from 'calypso/controller';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { addQueryArgs, getSiteFragment } from 'calypso/lib/route';
import { EDITOR_START, POST_EDIT } from 'calypso/state/action-types';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { getAdminMenu, getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { stopEditingPost } from 'calypso/state/editor/actions';
import { requestSelectedEditor } from 'calypso/state/selected-editor/actions';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import shouldLoadGutenframe from 'calypso/state/selectors/should-load-gutenframe';
import { requestSite } from 'calypso/state/sites/actions';
import {
	getSiteOption,
	isJetpackSite,
	isSSOEnabled,
	getSiteAdminUrl,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CalypsoifyIframe from './calypsoify-iframe';
import { Placeholder } from './placeholder';

const noop = () => {};

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

function waitForSiteIdAndSelectedEditor( context ) {
	return new Promise( ( resolve ) => {
		const unsubscribe = context.store.subscribe( () => {
			const state = context.store.getState();
			const siteId = getSelectedSiteId( state );
			if ( ! siteId ) {
				return;
			}
			const selectedEditor = getSelectedEditor( state, siteId );
			if ( ! selectedEditor ) {
				return;
			}
			unsubscribe();
			resolve();
		} );
		// Trigger a `store.subscribe()` callback
		context.store.dispatch(
			requestSelectedEditor( getSelectedSiteId( context.store.getState() ) )
		);
	} );
}

function isPreferredEditorViewAvailable( state ) {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId || getIsRequestingAdminMenu( state ) ) {
		return false;
	}
	return null !== getAdminMenu( state, siteId );
}

function waitForPreferredEditorView( context ) {
	return new Promise( ( resolve ) => {
		const unsubscribe = context.store.subscribe( () => {
			const state = context.store.getState();
			if ( ! isPreferredEditorViewAvailable( state ) ) {
				return;
			}
			unsubscribe();
			resolve();
		} );
		// Trigger a `store.subscribe()` callback
		context.store.dispatch( requestAdminMenu( getSelectedSiteId( context.store.getState() ) ) );
	} );
}

/**
 * Ensures the user is authenticated in WP Admin so the iframe can be loaded successfully.
 *
 * Simple sites users are always authenticated since the iframe is loaded through a *.wordpress.com URL (first-party
 * cookie).
 *
 * Atomic and Jetpack sites will load the iframe through a different domain (third-party cookie). This can prevent the
 * auth cookies from being stored while embedding WP Admin in Calypso (i.e. if the browser is preventing cross-site
 * tracking), so we redirect the user to the WP Admin login page in order to store the auth cookie. Users will be
 * redirected back to Calypso when they are authenticated in WP Admin.
 * @param {Object} context Shared context in the route.
 * @param {Function} next  Next registered callback for the route.
 * @returns {*}            Whatever the next callback returns.
 */
export const authenticate = ( context, next ) => {
	const state = context.store.getState();

	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );
	const isDesktop = isEnabled( 'desktop' );
	const storageKey = `gutenframe_${ siteId }_is_authenticated`;

	let isAuthenticated =
		globalThis.sessionStorage.getItem( storageKey ) || // Previously authenticated.
		! isJetpack || // If the site is not Jetpack (Atomic or self hosted) then it's a simple site and users are always authenticated.
		( isJetpack && isSSOEnabled( state, siteId ) ) || // Assume we can authenticate with SSO
		isDesktop || // The desktop app can store third-party cookies.
		context.query.authWpAdmin; // Redirect back from the WP Admin login page to Calypso.

	if ( isDesktop && isJetpack && ! isSSOEnabled( state, siteId ) ) {
		isAuthenticated = false;
	}

	if ( isAuthenticated ) {
		/*
		 * Make sure we have an up-to-date frame nonce.
		 *
		 * By requesting the site here instead of using <QuerySites /> we avoid a race condition, where
		 * if a render occurs before the site is requested, the first request for retrieving the iframe
		 * will get aborted.
		 */
		context.store.dispatch( requestSite( siteId ) );

		globalThis.sessionStorage.setItem( storageKey, 'true' );
		return next();
	}

	// Shows the editor placeholder while doing the redirection.
	context.primary = <Placeholder />;
	makeLayout( context, noop );
	render( context );

	// We could use `window.location.href` to generate the return URL but there are some potential race conditions that
	// can cause the browser to not update it before redirecting to WP Admin. To avoid that, we manually generate the
	// URL from the relevant parts.
	const origin = window.location.origin;
	let returnUrl = addQueryArgs(
		{ ...context.query, authWpAdmin: true },
		`${ origin }${ context.path }`
	);

	const siteAdminUrl = getSiteAdminUrl( state, siteId );

	// If non-SSO Jetpack lets ensure return URL uses the sites native editor, as the dotcom
	// redirect does not happen.
	if ( isJetpack && ! isSSOEnabled( state, siteId ) ) {
		const postType = determinePostType( context );
		const postId = getPostID( context );

		if ( postType ) {
			returnUrl = `${ siteAdminUrl }post-new.php?post_type=${ postType }`;

			if ( postId ) {
				returnUrl = `${ siteAdminUrl }post.php?post=${ postId }&action=edit`;
			}
		} else {
			returnUrl = `${ siteAdminUrl }site-editor.php`;
		}

		// pass along parameters, for example press-this
		returnUrl = addQueryArgs( context.query, returnUrl );
	}

	const wpAdminLoginUrl = addQueryArgs(
		{ redirect_to: returnUrl },
		`${ siteAdminUrl }../wp-login.php`
	);

	window.location.replace( wpAdminLoginUrl );
};

export const redirect = async ( context, next ) => {
	const {
		store: { getState },
	} = context;
	const tmpState = getState();
	const selectedEditor = getSelectedEditor( tmpState, getSelectedSiteId( tmpState ) );
	const checkPromises = [];
	if ( ! selectedEditor ) {
		checkPromises.push( waitForSiteIdAndSelectedEditor( context ) );
	}
	if ( ! isPreferredEditorViewAvailable( tmpState ) ) {
		checkPromises.push( waitForPreferredEditorView( context ) );
	}
	await Promise.all( checkPromises );

	const state = getState();
	const siteId = getSelectedSiteId( state );
	const isPostShare = context.query.is_post_share; // Added here https://github.com/Automattic/wp-calypso/blob/4b5fdb65b115e02baf743d2487eeca94fbd28a18/client/blocks/reader-share/index.jsx#L74

	// Force load Gutenframe when choosing to share a post to a Simple site.
	if ( isPostShare && isPostShare === 'true' && ! isAtomicSite( state, siteId ) ) {
		return next();
	}

	const postType = determinePostType( context );
	if ( ! shouldLoadGutenframe( state, siteId, postType ) ) {
		const postId = getPostID( context );

		const url = postType
			? getEditorUrl( state, siteId, postId, postType )
			: getSiteEditorUrl( state, siteId );
		// pass along parameters, for example press-this
		return window.location.replace( addQueryArgs( context.query, url ) );
	}
	return next();
};

function getPressThisData( query ) {
	const { url, text, title, comment_content, comment_author } = query;

	return url ? { url, text, title, comment_content, comment_author } : null;
}

function getBloggingPromptData( query ) {
	const { answer_prompt } = query;
	return answer_prompt ? { answer_prompt } : null;
}

function getAnchorFmData( query ) {
	const { anchor_podcast, anchor_episode, spotify_url } = query;
	return { anchor_podcast, anchor_episode, spotify_url };
}

function getSessionStorageOneTimeValue( key ) {
	const value = window.sessionStorage.getItem( key );
	window.sessionStorage.removeItem( key );
	return value;
}

export const post = ( context, next ) => {
	recordPageView( context.path, 'iFramed Editor', {
		iframedEditor: true,
		previousPath: context.previousPath,
	} );

	const postId = getPostID( context );
	const postType = determinePostType( context );
	const jetpackCopy = parseInt( context.query[ 'jetpack-copy' ] );

	// Check if this value is an integer.
	const duplicatePostId = Number.isInteger( jetpackCopy ) ? jetpackCopy : null;

	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const pressThisData = getPressThisData( context.query );
	const bloggingPromptData = getBloggingPromptData( context.query );
	const anchorFmData = getAnchorFmData( context.query );
	const parentPostId = parseInt( context.query.parent_post, 10 ) || null;

	// Set postId on state.editor.postId, so components like editor revisions can read from it.
	context.store.dispatch( { type: EDITOR_START, siteId, postId } );

	// Set post type on state.posts.[ id ].type, so components like document head can read from it.
	context.store.dispatch( { type: POST_EDIT, post: { type: postType }, siteId, postId } );

	context.primary = (
		<CalypsoifyIframe
			key={ postId }
			postId={ postId }
			postType={ postType }
			duplicatePostId={ duplicatePostId }
			pressThisData={ pressThisData }
			bloggingPromptData={ bloggingPromptData }
			anchorFmData={ anchorFmData }
			parentPostId={ parentPostId }
			creatingNewHomepage={ postType === 'page' && context.query.hasOwnProperty( 'new-homepage' ) }
			stripeConnectSuccess={ context.query.stripe_connect_success ?? null }
			showDraftPostModal={ getSessionStorageOneTimeValue(
				'wpcom_signup_complete_show_draft_post_modal'
			) }
		/>
	);

	return next();
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
