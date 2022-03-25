import { Page, Locator } from 'playwright';

const popoverParentSelector = '.block-editor-inserter__quick-inserter';
const selectors = {
	searchInput: `${ popoverParentSelector } input[type=search]`,
	blockResultItem: ( blockName: string ) =>
		`${ popoverParentSelector } [aria-label=Blocks] button:has-text("${ blockName }")`,
	patternResultItem: ( patternName: string ) =>
		`${ popoverParentSelector } [aria-label="Block Patterns] [aria-label=${ patternName }]`,
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
	 * Add a block from the popover inserter. Assumes the inserter is open.
	 *
	 * @param blockName Name of the block as it appears in the list of blocks in the inserter.
	 */
	async addBlock( blockName: string ): Promise< void > {
		const searchLocator = this.editor.locator( selectors.searchInput );
		await searchLocator.fill( blockName );

		const blockButtonLocator = this.editor.locator( selectors.blockResultItem( blockName ) );
		await blockButtonLocator.click();
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
