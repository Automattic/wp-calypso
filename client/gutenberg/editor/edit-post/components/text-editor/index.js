/**
 * WordPress dependencies
 */
import { PostTextEditor, PostTitle } from '@wordpress/editor';

/**
 * Internal dependencies
 */

function TextEditor() {
	return (
		<div className="edit-post-text-editor">
			<div className="edit-post-text-editor__body">
				<PostTitle />
				<PostTextEditor />
			</div>
		</div>
	);
}

export default TextEditor;
