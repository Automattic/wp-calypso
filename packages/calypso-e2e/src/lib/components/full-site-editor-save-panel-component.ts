import { Page, Locator } from 'playwright';

const panel = '.entities-saved-states__panel';
const selectors = {
	saveButton: `${ panel } button:has-text("Save")`,
};

/**
 * Represents an instance of the FSE save confirmation panel (comparable publish panel).
 */
export class FullSiteEditorSavePanelComponent {
	private page: Page;
	private editor: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {Locator} editor Locator or FrameLocator to the editor.
	 */
	constructor( page: Page, editor: Locator ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Publish or schedule the article.
	 */
	async confirmSave(): Promise< void > {
		const locator = this.editor.locator( selectors.saveButton );
		await locator.click();
	}
}
