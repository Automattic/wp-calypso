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
	const postType = determinePostType( context );
	//reserved space for adding the post to context see post-editor/controller.js
	context.primary = <GutenbergEditor postType={ postType } />;
	next();
};
