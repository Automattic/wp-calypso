import { initializeEditor, Editor } from './components';
import { EditorProps } from './types';

import './editor.scss';

/**
 * A simple Gutenberg editor component
 */
export const CommentBlockEditor: React.FC< EditorProps > = ( { initialContent, onChange } ) => {
	initializeEditor();

	return (
		<div id="verbum__block-editor">
			<Editor initialContent={ initialContent } onChange={ onChange } />
		</div>
	);
};
