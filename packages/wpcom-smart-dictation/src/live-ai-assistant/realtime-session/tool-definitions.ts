import { stopDictationToolDefinition } from '../tools/dictation-control-tool';
import {
	formatTextToolDefinition,
	getBlockToolDefinition,
	getBlockTypeToolDefinition,
	getBlockTypesToolDefinition,
	getEditorBlocksToolDefinition,
	getInserterItemsToolDefinition,
	getSelectedBlockToolDefinition,
	hasSelectedBlockToolDefinition,
	insertBlockToolDefinition,
	insertBlocksToolDefinition,
	moveBlockToolDefinition,
	removeAllBlocksToolDefinition,
	removeBlockToolDefinition,
	replaceBlockToolDefinition,
	selectBlockToolDefinition,
	updateBlockAttributesToolDefinition,
} from '../tools/editor-blocks-tool';
import {
	getPostInfoToolDefinition,
	publishPostToolDefinition,
	redoToolDefinition,
	savePostToolDefinition,
	setPostTitleToolDefinition,
	undoToolDefinition,
} from '../tools/editor-post-tool';
import { generateImageToolDefinition } from '../tools/generate-image-tool';
import { pickImageToolDefinition } from '../tools/image-picker-tool';
import { verifyYoutubeUrlToolDefinition } from '../tools/youtube-oembed-tool';

export const realtimeToolDefinitions = [
	getEditorBlocksToolDefinition,
	getSelectedBlockToolDefinition,
	getInserterItemsToolDefinition,
	hasSelectedBlockToolDefinition,
	selectBlockToolDefinition,
	getBlockTypesToolDefinition,
	getBlockTypeToolDefinition,
	insertBlockToolDefinition,
	insertBlocksToolDefinition,
	updateBlockAttributesToolDefinition,
	replaceBlockToolDefinition,
	removeBlockToolDefinition,
	removeAllBlocksToolDefinition,
	moveBlockToolDefinition,
	getBlockToolDefinition,
	formatTextToolDefinition,
	setPostTitleToolDefinition,
	savePostToolDefinition,
	publishPostToolDefinition,
	undoToolDefinition,
	redoToolDefinition,
	getPostInfoToolDefinition,
	verifyYoutubeUrlToolDefinition,
	pickImageToolDefinition,
	stopDictationToolDefinition,
	generateImageToolDefinition,
];
