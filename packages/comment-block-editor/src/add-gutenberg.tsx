import { createRoot } from '@wordpress/element';
import { initializeEditor, Editor } from './components';

import './editor.scss';

/**
 * Add Gutenberg editor to the page.
 * @param textarea    Textarea element.
 * @param updateValue Callback that runs when the editor content changes. It receives the serialized content as a parameter.
 */
export const addGutenberg = (
	textarea: HTMLTextAreaElement,
	updateValue: ( newValue: string ) => void
) => {
	initializeEditor();

	const editor = document.createElement( 'div' );
	editor.id = 'verbum__block-editor';

	// Insert after the textarea, and hide it
	textarea.after( editor );
	textarea.style.display = 'none';

	createRoot( editor ).render(
		<Editor initialContent={ textarea.value } onChange={ updateValue } />
	);
};
