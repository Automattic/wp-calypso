import { Page, Locator } from 'playwright';

const sidebarParentSelector = '.block-editor-inserter__content';
const selectors = {
	blockSearchInput: `${ sidebarParentSelector } input[type="search"]`,
	blockResultItem: ( name: string ) =>
		`${ sidebarParentSelector } .block-editor-block-types-list__list-item span:text("${ name }")`,
	patternResultItem: ( name: string ) => `${ sidebarParentSelector } div[aria-label="${ name }"]`,
};

/**
 * Represents the primary, sidebar block inserter in the editor.
 */
export class EditorSidebarBlockInserterComponent {
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
		const locator = this.editor.locator( selectors.blockSearchInput );
		await locator.fill( text );
	}

	/**
	 * Selects the maching result from the block inserter.
	 *
	 * By default, this method considers only the Block-type results
	 * (including Resuable blocks).
	 * In order to select from Pattern-type results, set the `type`
	 * optional flag in the parameter to `'pattern'`.
	 *
	 * Where mulltiple matches exist (eg. due to partial matching), the first result will be chosen.
	 */
	async selectBlockInserterResult(
		name: string,
		{ type = 'block' }: { type?: 'block' | 'pattern' } = {}
	): Promise< void > {
		let locator;

		if ( type === 'pattern' ) {
			locator = this.editor.locator( selectors.patternResultItem( name ) );
		} else {
			locator = this.editor.locator( selectors.blockResultItem( name ) );
		}
		await locator.first().click();
	}
}
