/**
 * External dependencies
 */
import React from 'react';
import { get, has, isInteger, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { EDITOR_START, POST_EDIT } from 'state/action-types';
import { getSelectedSiteId } from 'state/ui/selectors';
import CalypsoifyIframe from './calypsoify-iframe';
import { addQueryArgs } from 'lib/route';
import {
	getSiteUrl,
	getSiteOption,
	getSite,
	isJetpackSite,
	isSSOEnabled,
} from 'state/sites/selectors';
import isSiteWpcomAtomic from 'state/selectors/is-site-wpcom-atomic';
import { isEnabled } from 'config';
import { Placeholder } from './placeholder';
import { makeLayout, render } from 'controller';
import { REASON_BLOCK_EDITOR_JETPACK_REQUIRES_SSO } from 'state/desktop/window-events';
import { notifyDesktopCannotOpenEditor } from 'state/desktop/actions';
import { requestSite } from 'state/sites/actions';

function determinePostType( context ) {
	if ( context.path.startsWith( '/block-editor/post/' ) ) {
		return 'post';
	}
	if ( context.path.startsWith( '/block-editor/page/' ) ) {
		return 'page';
	}

	return context.params.customPostType;
}

//duplicated from post-editor/controller.js. We should import it from there instead
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
 *
 * @param {object} context  Shared context in the route.
 * @param {Function} next   Next registered callback for the route.
 * @returns {*}             Whatever the next callback returns.
 */
export const authenticate = ( context, next ) => {
	const state = context.store.getState();

	const siteId = getSelectedSiteId( state );
	const isDesktop = isEnabled( 'desktop' );
	const storageKey = `gutenframe_${ siteId }_is_authenticated`;

	let isAuthenticated =
		globalThis.sessionStorage.getItem( storageKey ) || // Previously authenticated.
		! isSiteWpcomAtomic( state, siteId ) || // Simple sites users are always authenticated.
		isDesktop || // The desktop app can store third-party cookies.
		context.query.authWpAdmin; // Redirect back from the WP Admin login page to Calypso.

	if ( isDesktop && isJetpackSite( state, siteId ) && ! isSSOEnabled( state, siteId ) ) {
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
	let origin = `${ window.location.protocol }//${ window.location.hostname }`;
	if ( window.location.port ) {
		origin += `:${ window.location.port }`;
	}
	const returnUrl = addQueryArgs(
		{ ...context.query, authWpAdmin: true },
		`${ origin }${ context.path }`
	);

	const siteUrl = getSiteUrl( state, siteId );
	const wpAdminLoginUrl = addQueryArgs( { redirect_to: returnUrl }, `${ siteUrl }/wp-login.php` );

	if ( isDesktop ) {
		context.store.dispatch(
			notifyDesktopCannotOpenEditor(
				getSite( state, siteId ),
				REASON_BLOCK_EDITOR_JETPACK_REQUIRES_SSO,
				context.path,
				wpAdminLoginUrl
			)
		);
	} else {
		window.location.replace( wpAdminLoginUrl );
	}
};

function getPressThisData( query ) {
	const { text, url, title, image, embed } = query;
	return url ? { text, url, title, image, embed } : null;
}

export const post = ( context, next ) => {
	// See post-editor/controller.js for reference.

	const postId = getPostID( context );
	const postType = determinePostType( context );
	const jetpackCopy = parseInt( get( context, 'query.jetpack-copy', null ) );

	// Check if this value is an integer.
	const duplicatePostId = isInteger( jetpackCopy ) ? jetpackCopy : null;

	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const pressThis = getPressThisData( context.query );
	const fseParentPageId = parseInt( context.query.fse_parent_post, 10 ) || null;
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
			pressThis={ pressThis }
			fseParentPageId={ fseParentPageId }
			parentPostId={ parentPostId }
			creatingNewHomepage={ postType === 'page' && has( context, 'query.new-homepage' ) }
			stripeConnectSuccess={ context.query.stripe_connect_success ?? null }
		/>
	);

	return next();
};

export const siteEditor = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	context.primary = (
		<CalypsoifyIframe
			// This key is added as a precaution due to it's oberserved necessity in the above post editor.
			// It will force the component to remount completely when the Id changes.
			key={ siteId }
			editorType={ 'site' }
		/>
	);

	return next();
};
