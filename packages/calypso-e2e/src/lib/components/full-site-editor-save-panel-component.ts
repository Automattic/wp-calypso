import { Page } from 'playwright';
import { EditorWindow } from './editor-window';

const panel = '.entities-saved-states__panel';
const selectors = {
	saveButton: `${ panel } button:has-text("Save")`,
};

/**
 * Represents an instance of the FSE save confirmation panel (comparable publish panel).
 */
export class FullSiteEditorSavePanelComponent {
	private page: Page;
	private editorWindow: EditorWindow;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.editorWindow = new EditorWindow( page );
	}

	/**
	 * Publish or schedule the article.
	 */
	async confirmSave(): Promise< void > {
		const editorFrame = await this.editorWindow.getEditorFrame();
		const locator = editorFrame.locator( selectors.saveButton );
		await locator.click();
	}
}
