import React, { createRoot } from '@wordpress/element';
import { EmbedRequestParams, addApiMiddleware } from './api';
import { Editor } from './editor';
import { loadBlocksWithCustomizations } from './load-blocks';
import { loadTextFormatting } from './load-text-formatting';

/**
 * Add Gutenberg editor to the page.
 * @param textarea   Textarea element.
 * @param setComment Callback that runs when the editor content changes.
 *                   It receives the serialized content as a parameter.
 * @param isRTL      Whether the editor should be RTL.
 * @param requestParamsGenerator Function that generates request params for embeds. It receives the embed URL as a parameter.
 */
export const attachGutenberg = (
	textarea: HTMLTextAreaElement,
	setComment: ( newValue: string ) => void,
	isRTL = false,
	requestParamsGenerator: ( embedURL: string ) => EmbedRequestParams,
	isDarkMode = false
) => {
	const editor = document.createElement( 'div' );
	editor.className = 'verbum-editor-wrapper';

	// Insert after the textarea, and hide it
	textarea.after( editor );
	textarea.style.display = 'none';

	loadBlocksWithCustomizations();
	loadTextFormatting();
	addApiMiddleware( requestParamsGenerator );

	createRoot( editor ).render(
		<Editor
			initialContent={ textarea.value }
			isRTL={ isRTL }
			onChange={ ( content ) => setComment( content ) }
			isDarkMode={ isDarkMode }
		/>
	);
};
