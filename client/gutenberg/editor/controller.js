/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import GutenbergEditor from 'gutenberg/editor/main';

function getPostID( context ) {
	if ( ! context.params.post || 'new' === context.params.post ) {
		return null;
	}

	// both post and site are in the path
	return parseInt( context.params.post, 10 );
}

function determinePostType( context ) {
	if ( startsWith( context.path, '/gutenberg/post' ) ) {
		return 'post';
	}

	if ( startsWith( context.path, '/gutenberg/page' ) ) {
		return 'page';
	}

	return context.params.type;
}

export const post = ( context, next ) => {
	//reserved space for adding the post to context see post-editor/controller.js
	context.primary = (
		<GutenbergEditor postId={ getPostID( context ) } postType={ determinePostType( context ) } />
	);
	next();
};
