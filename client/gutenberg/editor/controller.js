/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { get, isInteger } from 'lodash';

/**
 * Internal dependencies
 */
import { shouldLoadGutenberg } from 'state/selectors/should-load-gutenberg';
import { shouldRedirectGutenberg } from 'state/selectors/should-redirect-gutenberg';
import { EDITOR_START } from 'state/action-types';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
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
