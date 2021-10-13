import { Page, ElementHandle } from 'playwright';

const selectors = {
	block: '.wp-block-coblocks-dynamic-separator',
};

/**
 * Represents the Dynamic HR coblock.
 */
export class DynamicHRBlock {
	// Static properties.
	static blockName = 'Dynamic HR';
	static blockEditorSelector = '[aria-label="Block: Dynamic HR"]';
	block: ElementHandle;

	/**
	 * Constructs an instance of this block.
	 *
	 * @param {ElementHandle} block Handle referencing the block as inserted on the Gutenberg editor.
	 */
	constructor( block: ElementHandle ) {
		this.block = block;
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 * @returns {Promise<void>} No return value.
	 */
	static async validatePublishedContent( page: Page ): Promise< void > {
		await page.waitForSelector( selectors.block );
	}
}
