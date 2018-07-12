/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import GutenbergEditor from 'gutenberg/editor/main';

export const post = ( context, next ) => {
	//reserved space for adding the post to context see post-editor/controller.js
	context.primary = <GutenbergEditor />;
	next();
};
