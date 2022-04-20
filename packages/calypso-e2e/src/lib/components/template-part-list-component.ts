import { Locator, Page } from 'playwright';

const parentSelector = '[aria-label="Template parts list - Content"]';

const selectors = {
	deletePartButton: `${ parentSelector } button:has-text("Delete")`,
	actionsButtonForPart: ( partName: string ) =>
		`${ parentSelector } .edit-site-list-table-row:has-text("${ partName }") button[aria-label="Actions"]`,
	deletionToast: ( partName: string ) =>
		`.components-snackbar:has-text('"${ partName }" deleted.')`,
};

/**
 * Represents the list of template parts in the full site editor.
 */
export class TemplatePartListComponent {
	private page: Page;
	private editor: Locator;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 * @param {Locator} editor Frame-safe locator to the editor.
	 */
	constructor( page: Page, editor: Locator ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 *
	 * @param partName
	 */
	async deleteTemplatePart( partName: string ): Promise< void > {
		const actionsButtonLocator = this.editor.locator( selectors.actionsButtonForPart( partName ) );
		await actionsButtonLocator.click();

		const deleteButtonLocator = this.editor.locator( selectors.deletePartButton );
		await deleteButtonLocator.click();

		const deletionToastLocator = this.editor.locator( selectors.deletionToast( partName ) );
		await deletionToastLocator.waitFor();
	}
}
