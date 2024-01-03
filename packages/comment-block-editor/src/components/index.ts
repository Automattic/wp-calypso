import { addApiMiddleware } from './api';
import { loadBlocksWithCustomizations } from './block-loader';
import { loadTextFormatting } from './format-loader';

/**
 * This registers all the necessary Gutenberg things. Blocks, rich text formatting, API middleware etc.
 */
export const initializeEditor = () => {
	// Only load these once
	if ( window.commentBlockEditorInitialized ) {
		return;
	}

	loadBlocksWithCustomizations();
	loadTextFormatting();
	addApiMiddleware();

	window.commentBlockEditorInitialized = true;
};

export { Editor } from './editor';
