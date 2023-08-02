import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

const panel = '.entities-saved-states__panel';
const selectors = {
	saveButton: `${ panel } button:has-text("Save")`,
};

/**
 * Represents an instance of the FSE save confirmation panel (comparable publish panel).
 */
export class FullSiteEditorSavePanelComponent {
	private page: Page;
	private editor: EditorComponent;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {EditorComponent} editor The EditorComponent instance.
	 */
	constructor( page: Page, editor: EditorComponent ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Publish or schedule the article.
	 */
	async confirmSave(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.saveButton );
		await locator.click();
	}
}
