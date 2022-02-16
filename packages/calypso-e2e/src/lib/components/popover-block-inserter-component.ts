import { Frame, Page } from 'playwright';

const popoverParentSelector = '.block-editor-inserter__quick-inserter';
const selectors = {
	searchInput: `${ popoverParentSelector } input[type=search]`,
	blockButton: ( blockName: string ) =>
		`${ popoverParentSelector } [aria-label=Blocks] button:has-text("${ blockName }")`,
};

/**
 * Represents the inline, popover block inserter in the editor.
 */
export class PopoverBlockInserterComponent {
	private page: Page;
	private editorIframe: Frame;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Frame} editorIframe Iframe from the gutenberg editor.
	 * @param {Page} page Object representing the base page.
	 */
	constructor( editorIframe: Frame, page: Page ) {
		this.page = page;
		this.editorIframe = editorIframe;
	}

	/**
	 * Add a block from the popover inserter. Assumes the inserter is open.
	 *
	 * @param blockName Name of the block as it appears in the list of blocks in the inserter.
	 */
	async addBlock( blockName: string ): Promise< void > {
		await this.editorIframe.fill( selectors.searchInput, blockName );
		await this.editorIframe.click( selectors.blockButton( blockName ) );
	}
}
