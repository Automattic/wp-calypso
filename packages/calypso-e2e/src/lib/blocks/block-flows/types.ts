import { Browser, Locator, Page } from 'playwright';
import { EditorPage } from '../../pages';

/**
 * An interface for block-based flows to enable iterating the same smoke test cases for a set of blocks.
 */
export interface BlockFlow {
	blockSidebarName: string;
	blockTestName?: string;
	blockTestFallBackName?: string;
	blockEditorSelector: string;
	blockInsertedPopupConfirmButtonSelector?: string;
	noSearch?: boolean;
	configure?( context: EditorContext ): Promise< void >;
	validateAfterPublish?( context: PublishedPostContext ): Promise< void >;
}

/**
 * An interface representing all the Playwright & DOM context that might be needed when taking actions on a block in the editor.
 */
export interface EditorContext {
	page: Page;
	// Technically, we don't necessarily need to include these next properties in this interface.
	// We could make the EditorPage from the Playwright page and our ENV variables.
	// We could also then get the editorLocator off of the EditorPage.
	// However, they are provided in this context for convenience to simplify the writing of block flows!
	editorPage: EditorPage;
	addedBlockLocator: Locator;
}

/**
 * An interface representing all the Playwright & DOM context that might be needed when validataing a block in a published post.
 */
export interface PublishedPostContext {
	browser: Browser;
	page: Page;
}
