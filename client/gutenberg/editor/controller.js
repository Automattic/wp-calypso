/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import GutenbergEditor from 'gutenberg/editor/main';
import { getSelectedSiteId } from 'state/ui/selectors';

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

	const unsubscribe = context.store.subscribe( () => {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );

		if ( ! siteId ) {
			return;
		}

		unsubscribe();

		context.primary = <GutenbergEditor { ...{ siteId, postId, postType, uniqueDraftKey } } />;

		next();
	} );
};
