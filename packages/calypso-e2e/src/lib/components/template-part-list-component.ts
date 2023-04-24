import { Page } from 'playwright';
import { EditorWindow } from './editor-window';

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
	private editorWindow: EditorWindow;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {EditorWindow} editorWindow The EditorWindow instance.
	 */
	constructor( page: Page, editorWindow: EditorWindow ) {
		this.page = page;
		this.editorWindow = editorWindow;
	}

	/**
	 * Delete a template part from the list.
	 *
	 * @param {string} name The name of the template part to delete.
	 */
	async deleteTemplatePart( name: string ): Promise< void > {
		const editorFrame = await this.editorWindow.getEditorFrame();
		const actionsButtonLocator = editorFrame.locator( selectors.actionsButtonForPart( name ) );
		await actionsButtonLocator.click();

		const deleteButtonLocator = editorFrame.locator( selectors.deleteButton );
		await deleteButtonLocator.click();
	}

	/**
	 * Checks if the template part list is open and visible.
	 *
	 * @returns True if the template part list component is open and visible, false otherwise.
	 */
	async isOpen(): Promise< boolean > {
		const editorFrame = await this.editorWindow.getEditorFrame();
		const shellLocator = editorFrame.locator( parentSelector );
		return ( await shellLocator.count() ) > 0;
	}
}
