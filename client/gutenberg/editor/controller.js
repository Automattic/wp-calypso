/**
 * External dependencies
 */
import React from 'react';
import { get, has, isInteger, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { isEligibleForGutenframe } from 'calypso/state/gutenberg-iframe-eligible/is-eligible-for-gutenframe';
import { EDITOR_START, POST_EDIT } from 'calypso/state/action-types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CalypsoifyIframe from './calypsoify-iframe';
import getGutenbergEditorUrl from 'calypso/state/selectors/get-gutenberg-editor-url';
import { addQueryArgs } from 'calypso/lib/route';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import { requestSelectedEditor } from 'calypso/state/selected-editor/actions';
import {
	getSiteUrl,
	getSiteOption,
	getSite,
	isJetpackSite,
	isSSOEnabled,
} from 'calypso/state/sites/selectors';
import { isEnabled } from '@automattic/calypso-config';
import { Placeholder } from './placeholder';

import { makeLayout, render } from 'calypso/controller';
import isSiteUsingCoreSiteEditor from 'calypso/state/selectors/is-site-using-core-site-editor';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import { REASON_BLOCK_EDITOR_JETPACK_REQUIRES_SSO } from 'calypso/state/desktop/window-events';
import { notifyDesktopCannotOpenEditor } from 'calypso/state/desktop/actions';
import { requestSite } from 'calypso/state/sites/actions';
import { stopEditingPost } from 'calypso/state/editor/actions';

function determinePostType( context ) {
	if ( context.path.startsWith( '/post/' ) ) {
		return 'post';
	}
	if ( context.path.startsWith( '/page/' ) ) {
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

export const redirect = async ( context, next ) => {
	const {
		store: { getState },
	} = context;
	const tmpState = getState();
	const selectedEditor = getSelectedEditor( tmpState, getSelectedSiteId( tmpState ) );
	if ( ! selectedEditor ) {
		await waitForSiteIdAndSelectedEditor( context );
	}

	const state = getState();
	const siteId = getSelectedSiteId( state );

	if ( ! isEligibleForGutenframe( state, siteId ) ) {
		const postType = determinePostType( context );
		const postId = getPostID( context );

		const url =
			postType || ! isSiteUsingCoreSiteEditor( state, siteId )
				? getGutenbergEditorUrl( state, siteId, postId, postType )
				: getSiteEditorUrl( state, siteId );
		// pass along parameters, for example press-this
		return window.location.replace( addQueryArgs( context.query, url ) );
	}

	return next();
};

function getPressThisData( query ) {
	const { text, url, title, image, embed } = query;
	return url ? { text, url, title, image, embed } : null;
}

function getAnchorFmData( query ) {
	const { anchor_podcast, anchor_episode, spotify_url } = query;
	return { anchor_podcast, anchor_episode, spotify_url };
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
	const anchorFmData = getAnchorFmData( context.query );
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
			anchorFmData={ anchorFmData }
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

export const exitPost = ( context, next ) => {
	const postId = getPostID( context );
	const siteId = getSelectedSiteId( context.store.getState() );
	if ( siteId ) {
		context.store.dispatch( stopEditingPost( siteId, postId ) );
	}
	next();
};
