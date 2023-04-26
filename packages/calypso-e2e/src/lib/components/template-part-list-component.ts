import { Locator, Page } from 'playwright';

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
	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 * @param {Locator} editor Frame-safe locator to the editor.
	 */
	constructor( private page: Page, private editor: Locator ) {}

	/**
	 * Delete a template part from the list.
	 *
	 * @param {string} name The name of the template part to delete.
	 */
	async deleteTemplatePart( name: string ): Promise< void > {
		const actionsButtonLocator = this.editor.locator( selectors.actionsButtonForPart( name ) );
		await actionsButtonLocator.click();

		const deleteButtonLocator = this.editor.locator( selectors.deleteButton );
		await deleteButtonLocator.click();
	}

	/**
	 * Checks if the template part list is open and visible.
	 *
	 * @returns True if the template part list component is open and visible, false otherwise.
	 */
	async isOpen(): Promise< boolean > {
		const shellLocator = this.editor.locator( parentSelector );
		return ( await shellLocator.count() ) > 0;
	}
}
