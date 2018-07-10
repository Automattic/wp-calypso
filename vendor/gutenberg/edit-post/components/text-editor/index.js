/**
 * WordPress dependencies
 */
import { PostTextEditor, PostTitle } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './style.scss';

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
