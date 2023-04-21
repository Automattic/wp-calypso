import { Page } from 'playwright';
import { EditorWindow } from './editor-window';

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
	private editorWindow: EditorWindow;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.editorWindow = new EditorWindow( page );
	}

	/**
	 * Clicks the first block entry in the list view that has the provided block name (e.g. "Heading").
	 *
	 * @param {string} blockName Name of the block type (e.g. "Heading").
	 */
	async clickFirstBlockOfType( blockName: string ): Promise< void > {
		const editorFrame = await this.editorWindow.getEditorFrame();
		const locator = editorFrame.locator( selectors.blockLink( blockName ) ).first();
		await locator.click();
	}

	/**
	 * Selects and highlights all blocks in the list view.
	 */
	async selectAllBlocks(): Promise< void > {
		const editorFrame = await this.editorWindow.getEditorFrame();
		const firstBlockLocator = editorFrame.locator(
			selectors.blockByLocation( { level: 1, position: 1 } )
		);
		const numberOfBlocksInParentLevel = Number(
			await firstBlockLocator.getAttribute( 'aria-setsize' )
		);
		if ( ! numberOfBlocksInParentLevel ) {
			throw new Error( "Couldn't determine number of parent level blocks in the list view." );
		}

		const lastBlockLocator = editorFrame.locator(
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
		const editorFrame = await this.editorWindow.getEditorFrame();
		const locator = editorFrame.locator(
			`${ selectors.blockByLocation( location ) } >> ${ selectors.moreOptionsButton }`
		);
		await locator.click();
	}
}
