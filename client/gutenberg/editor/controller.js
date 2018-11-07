/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { has, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { EDITOR_START } from 'state/action-types';
import { initGutenberg } from './init';

function determinePostType( context ) {
	if ( context.path.startsWith( '/gutenberg/post/' ) ) {
		return 'post';
	}
	if ( context.path.startsWith( '/gutenberg/page/' ) ) {
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

export const post = ( context, next ) => {
	//see post-editor/controller.js for reference

	const uniqueDraftKey = uniqueId( 'gutenberg-draft-' );
	const postId = getPostID( context );
	const postType = determinePostType( context );
	const isDemoContent = ! postId && has( context.query, 'gutenberg-demo' );

	const unsubscribe = context.store.subscribe( () => {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSelectedSiteSlug( state );
		const userId = getCurrentUserId( state );

		if ( ! siteId ) {
			return;
		}

		unsubscribe();

		//set postId on state.ui.editor.postId, so components like editor revisions can read from it
		context.store.dispatch( { type: EDITOR_START, siteId, postId } );

		const GutenbergEditor = initGutenberg( userId, siteSlug );

		context.primary = (
			<GutenbergEditor { ...{ siteId, postId, postType, uniqueDraftKey, isDemoContent } } />
		);

		next();
	} );
};
