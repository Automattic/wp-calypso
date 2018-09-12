/** @format */
/**
 * External dependencies
 */
import React from 'react';

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

export const post = ( context, next ) => {
	const postType = determinePostType( context );
	//reserved space for adding the post to context see post-editor/controller.js
	context.primary = <GutenbergEditor postType={ postType } />;
	next();
};
