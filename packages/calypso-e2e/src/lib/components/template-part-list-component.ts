import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

const parentSelector = '.dataviews-wrapper';

const selectors = {
	// Each template part is a card in the DataViews grid.
	cardForPart: '.dataviews-view-grid__card',
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
		// Substring match on the card. Template-part names are generated with a
		// millisecond timestamp (see callers), so within a run the target name is
		// unique and is not a substring of any accumulated leftover part's name.
		const card = editorParent.locator( selectors.cardForPart ).filter( { hasText: name } );
		await card.getByRole( 'button', { name: 'Actions' } ).click();

		// The Actions dropdown exposes Delete/Edit/Duplicate/Rename menu items.
		await editorParent.getByRole( 'menuitem', { name: 'Delete' } ).first().click();

		// Deleting requires confirming in a dialog.
		await editorParent
			.getByRole( 'dialog' )
			.getByRole( 'button', { name: 'Delete', exact: true } )
			.click();
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
