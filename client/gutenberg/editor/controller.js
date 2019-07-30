/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { get, isInteger } from 'lodash';
import urlLib from 'url';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { shouldLoadGutenberg } from 'state/selectors/should-load-gutenberg';
import { shouldRedirectGutenberg } from 'state/selectors/should-redirect-gutenberg';
import { EDITOR_START } from 'state/action-types';
import { getSelectedSiteId, getSelectedSiteSlug, getSelectedSite } from 'state/ui/selectors';
import getCurrentRoute from 'state/selectors/get-current-route';
import CalypsoifyIframe from './calypsoify-iframe';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import { addQueryArgs } from 'lib/route';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import { requestSelectedEditor } from 'state/selected-editor/actions';

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

	// both post and site are in the path
	return parseInt( context.params.post, 10 );
}

function waitForSiteIdAndSelectedEditor( context ) {
	return new Promise( resolve => {
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

function handleJetpackSSO( context ) {
	// If we are dealing with an Atomic or Jetpack site we need to make sure that Jetpack SSO
	// has been handled before we load the editor in an iFrame in order to prevent any issues
	// with 3rd party cookie setting being blocked by the browser
	const state = context.store.getState();
	const currentRoute = getCurrentRoute( state );

	const { URL: selectedSiteUrl, domain: selectedSiteDomain, jetpack } = getSelectedSite( state );

	if ( ! jetpack ) {
		return;
	}

	const {
		hostname: parentDomain,
		protocol: parentProtocol,
		port,
		query: parentQuery,
	} = urlLib.parse( window.location.href, true );
	const parentPort = port ? `:${ port }` : '';

	// check query params from parent frame to check if we have already redirected back from Jetpack auth.
	if ( parentQuery.jetpackSSO ) {
		// If successfully redirected save to session storage so we don't need to redirect on every editor load
		sessionStorage.setItem( `calypsoify_${ selectedSiteDomain }_jetpackSSO`, 'true' );
		return;
	}

	if ( sessionStorage.getItem( `calypsoify_${ selectedSiteDomain }_jetpackSSO` ) ) {
		return;
	}

	// if site is not authenticated yet then redirect to that domain to auth
	// and redirect back here with jetpackSSO param set
	parentQuery.jetpackSSO = 'true';
	const returnURL = encodeURIComponent(
		`${ parentProtocol }//${ parentDomain }${ parentPort }${ currentRoute }?${ stringify(
			parentQuery
		) }`
	);
	window.location.href = `${ selectedSiteUrl }/wp-login.php?redirect_to=${ returnURL }`;
}

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

	if ( shouldRedirectGutenberg( state, siteId ) ) {
		const postType = determinePostType( context );
		const postId = getPostID( context );
		const url = getGutenbergEditorUrl( state, siteId, postId, postType );
		// pass along parameters, for example press-this
		return window.location.replace( addQueryArgs( context.query, url ) );
	}

	if ( shouldLoadGutenberg( state, siteId ) ) {
		return next();
	}

	return page.redirect( `/post/${ getSelectedSiteSlug( state ) }` );
};

function getPressThisData( query ) {
	const { text, url, title, image, embed } = query;
	return url ? { text, url, title, image, embed } : null;
}

export const post = ( context, next ) => {
	// See post-editor/controller.js for reference.

	handleJetpackSSO( context );
	const postId = getPostID( context );
	const postType = determinePostType( context );
	const jetpackCopy = parseInt( get( context, 'query.jetpack-copy', null ) );

	// Check if this value is an integer.
	const duplicatePostId = isInteger( jetpackCopy ) ? jetpackCopy : null;

	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const pressThis = getPressThisData( context.query );
	const fseParentPageId = parseInt( context.query.fse_parent_post, 10 ) || null;

	// Set postId on state.ui.editor.postId, so components like editor revisions can read from it.
	context.store.dispatch( { type: EDITOR_START, siteId, postId } );

	context.primary = (
		<CalypsoifyIframe
			postId={ postId }
			postType={ postType }
			duplicatePostId={ duplicatePostId }
			pressThis={ pressThis }
			fseParentPageId={ fseParentPageId }
		/>
	);

	return next();
};
