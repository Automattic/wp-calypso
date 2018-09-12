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
	//reserved space for adding the post to context see post-editor/controller.js
	const postId = getPostID( context );
	const uniqueDraftId = uniqueId( 'gutenberg-draft-' );
	const postType = determinePostType( context );

	//reserved space for adding the post to context see post-editor/controller.js
	context.primary = <GutenbergEditor { ...{ postId, postType, uniqueDraftId } } />;
	next();
};
