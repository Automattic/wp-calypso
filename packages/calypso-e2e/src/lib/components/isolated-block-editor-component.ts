import { Page, ElementHandle } from 'playwright';

const selectors = {
	blockInserterToggle: 'button[aria-label="Toggle block inserter"]',
	blockInserterSearch: 'input[placeholder="Search"]',
	blockInserterResultItem: '.block-editor-block-types-list__list-item',

	// Publish
	postButton: 'a:text("Post")',
};
/**
 * Represents an instance of the WPCOM's Gutenberg editor page.
 */
export class IsolatedBlockEditorComponent {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Given a block name, insert a matching block to the editor.
	 *
	 * This method is nearly identical to the method also named `addBlock` in `GutenbergEditorPage`.
	 * However, the major distinction is the use of `Page` vs `Frame`.
	 *
	 * This is because a P2 frontend (or inline) editor is not a part of an embedded iframe.
	 *
	 * @param {string} blockName Name of the block to be inserted.
	 * @param {string} blockEditorSelector Unique selector to locate the inserted block in the editor.
	 * 	Typically built into the definition file for the block being inserted.
	 * @returns {ElementHandle} Reference to the inserted block in the editor.
	 */
	async addBlock( blockName: string, blockEditorSelector: string ): Promise< ElementHandle > {
		// Click on the editor title. This has the effect of dismissing the block inserter
		// if open, and restores focus back to the editor root container, allowing insertion
		// of blocks.
		await this.page.click( selectors.blockInserterToggle );
		await this.page.fill( selectors.blockInserterSearch, blockName );
		await this.page.click( `${ selectors.blockInserterResultItem } span:text("${ blockName }")` );
		// Confirm the block has been added to the editor body.
		return await this.page.waitForSelector( `${ blockEditorSelector }.is-selected` );
	}

	/**
	 * Click on the `Post` button to submit the contents of the editor as a new post.
	 */
	async submitPost(): Promise< void > {
		await this.page.click( selectors.postButton );
	}
}
