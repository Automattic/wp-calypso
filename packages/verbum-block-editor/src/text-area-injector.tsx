import { createRoot } from '@wordpress/element';
import { addApiMiddleware } from './api';
import { Editor } from './editor';
import { loadBlocksWithCustomizations } from './load-blocks';
import { loadTextFormatting } from './load-text-formatting';

/**
 * Add Gutenberg editor to the page.
 * @param textarea   Textarea element.
 * @param setComment Callback that runs when the editor content changes.
 *                   It receives the serialized content as a parameter.
 */
export const attachGutenberg = (
	textarea: HTMLTextAreaElement,
	setComment: ( newValue: string ) => void,
	isRTL = false
) => {
	const editor = document.createElement( 'div' );
	editor.id = 'editor__wrapper';

	// Insert after the textarea, and hide it
	textarea.after( editor );
	textarea.style.display = 'none';

	loadBlocksWithCustomizations();
	loadTextFormatting();
	addApiMiddleware( 1 );

	createRoot( editor ).render(
		<Editor
			initialContent={ textarea.value }
			isRTL={ isRTL }
			onChange={ ( content ) => setComment( content ) }
		/>
	);
};
