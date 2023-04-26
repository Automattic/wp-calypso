import { Page, Locator } from 'playwright';

const popoverParentSelector = '.block-editor-inserter__quick-inserter';
const selectors = {
	searchInput: `${ popoverParentSelector } input[type=search]`,
};

/**
 * Represents the inline, popover block inserter in the editor.
 */
export class EditorInlineBlockInserterComponent {
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
	 * Searches the Block Inserter for the provided string.
	 *
	 * @param {string} text Text to enter into the search input.
	 */
	async searchBlockInserter( text: string ): Promise< void > {
		const locator = this.editor.locator( selectors.searchInput );
		await locator.fill( text );
	}

	/**
	 * Selects the maching result from the block inserter.
	 *
	 * Where mulltiple matches exist (eg. due to partial matching), the first
	 * result will be chosen.
	 */
	async selectBlockInserterResult( name: string ): Promise< void > {
		await this.editor.getByRole( 'option', { name, exact: true } ).first().click();
	}
}
