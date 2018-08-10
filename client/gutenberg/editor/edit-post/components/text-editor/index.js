/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { PostTextEditor, PostTitle } from '@wordpress/editor';

function TextEditor() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="edit-post-text-editor">
			<div className="edit-post-text-editor__body">
				<PostTitle />
				<PostTextEditor />
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default TextEditor;
