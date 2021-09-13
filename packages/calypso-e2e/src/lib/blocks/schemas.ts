import { ElementHandle, Frame, Page } from 'playwright';

/**
 * An interface for block-based flows to enable iterating the same smoke test cases for a set of blocks.
 */
export interface BlockFlow {
	blockSidebarName: string;
	blockEditorSelector: string;
	configure( context: EditorContext ): Promise< void >;
	validateAfterPublish( context: PublishedPostContext ): Promise< void >;
}

/**
 * An interface representing all the Playwright & DOM context that might be needed when taking actions on a block in the editor.
 */
export interface EditorContext {
	page: Page;
	editorIframe: Frame;
	blockHandle: ElementHandle;
}

/**
 * An interface representing all the Playwright & DOM context that might be needed when validataing a block in a published post.
 */
export interface PublishedPostContext {
	page: Page;
}
