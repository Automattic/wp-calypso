import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

const parentSelector = '[aria-label="Template parts list - Content"]';

const selectors = {
	deleteButton: '[aria-label="Actions"] button :text("Delete")',
	actionsButtonForPart: ( partName: string ) =>
		`.edit-site-list-table-row:has-text("${ partName }") button[aria-label="Actions"]`,
};

/**
 * Represents the list of template parts in the full site editor.
 */
export class TemplatePartListComponent {
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
	 * Delete a template part from the list.
	 *
	 * @param {string} name The name of the template part to delete.
	 */
	async deleteTemplatePart( name: string ): Promise< void > {
		const editorParent = await this.editor.parent();
		const actionsButtonLocator = editorParent.locator( selectors.actionsButtonForPart( name ) );
		await actionsButtonLocator.click();

		const deleteButtonLocator = editorParent.locator( selectors.deleteButton );
		await deleteButtonLocator.click();
	}

	/**
	 * Checks if the template part list is open and visible.
	 *
	 * @returns True if the template part list component is open and visible, false otherwise.
	 */
	async isOpen(): Promise< boolean > {
		const editorParent = await this.editor.parent();
		const shellLocator = editorParent.locator( parentSelector );
		return ( await shellLocator.count() ) > 0;
	}
}
