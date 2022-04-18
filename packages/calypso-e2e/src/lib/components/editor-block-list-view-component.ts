import { Locator, Page } from 'playwright';

const selectors = {
	blockLink: ( blockName: string ) => `.block-editor-list-view-leaf a:has-text("${ blockName }")`,
	moreOptionsButton: 'button[aria-label^="Options for"]',
	blockByLocation: ( { level, position }: BlockListLocation ) =>
		`.block-editor-list-view-leaf[aria-level=${ level }][aria-posinset=${ position }]`,
};

interface BlockListLocation {
	level: number;
	position: number;
}

/**
 * Represents an instance of the WordPress.com Editor's sidebar list view.
 * The component is available only in the Desktop viewport.
 */
export class EditorBlockListViewComponent {
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
	 * Clicks the first block entry in the list view that has the provided block name (e.g. "Heading").
	 *
	 * @param {string} blockName Name of the block type (e.g. "Heading").
	 */
	async clickFirstBlockOfType( blockName: string ): Promise< void > {
		const locator = this.editor.locator( selectors.blockLink( blockName ) ).first();
		await locator.click();
	}

	/**
	 * Selects and highlights all blocks in the list view.
	 */
	async selectAllBlocks(): Promise< void > {
		const firstBlockLocator = this.editor.locator(
			selectors.blockByLocation( { level: 1, position: 1 } )
		);
		const numberOfBlocksInParentLevel = Number(
			await firstBlockLocator.getAttribute( 'aria-setsize' )
		);
		if ( ! numberOfBlocksInParentLevel ) {
			throw new Error( "Couldn't determine number of parent level blocks in the list view." );
		}

		const lastBlockLocator = this.editor.locator(
			selectors.blockByLocation( { level: 1, position: numberOfBlocksInParentLevel } )
		);

		await firstBlockLocator.click();
		await lastBlockLocator.click( { modifiers: [ 'Shift' ] } );
	}

	/**
	 * Opens the "more options" (three dots) menu for a given block in the list view.
	 *
	 * @param {BlockListLocation} location Location of block in the block list tree.
	 */
	async openOptionsForBlock( location: BlockListLocation ): Promise< void > {
		const locator = this.editor.locator(
			`${ selectors.blockByLocation( location ) } >> ${ selectors.moreOptionsButton }`
		);
		await locator.click();
	}
}
