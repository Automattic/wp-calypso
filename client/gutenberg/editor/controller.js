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
import isGutenbergEnabled from 'state/selectors/is-gutenberg-enabled';
import isWpAdminGutenbergEnabled from 'state/selectors/is-wp-admin-gutenberg-enabled';
import { EDITOR_START } from 'state/action-types';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import CalypsoifyIframe from './calypsoify-iframe';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import { addQueryArgs } from 'lib/route';

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

export const redirect = ( context, next ) => {
	const {
		store: { getState },
	} = context;
	const state = getState();
	const siteId = getSelectedSiteId( state );

	if ( isWpAdminGutenbergEnabled( state, siteId ) ) {
		const postType = determinePostType( context );
		const postId = getPostID( context );
		const url = getGutenbergEditorUrl( state, siteId, postId, postType );
		// pass along parameters, for example press-this
		return window.location.replace( addQueryArgs( context.query, url ) );
	}

	if ( isGutenbergEnabled( state, siteId ) ) {
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

	// Set postId on state.ui.editor.postId, so components like editor revisions can read from it.
	context.store.dispatch( { type: EDITOR_START, siteId, postId } );

	context.primary = (
		<CalypsoifyIframe
			postId={ postId }
			postType={ postType }
			duplicatePostId={ duplicatePostId }
			pressThis={ pressThis }
		/>
	);

	return next();
};
