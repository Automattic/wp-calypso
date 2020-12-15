/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import PostTextEditor from './post-text-editor';

/**
 * This is a copy of packages/edit-post/src/components/text-editor/index.js
 *
 * The original is not exported, and contains code for post titles
 */
function TextEditor( {} ) {
	return (
		<div className="edit-post-text-editor">
			<div className="edit-post-text-editor__body">
				<PostTextEditor />
			</div>
		</div>
	);
}

export default TextEditor;
