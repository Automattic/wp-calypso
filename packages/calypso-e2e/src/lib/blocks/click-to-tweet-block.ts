import { Page, ElementHandle } from 'playwright';

const selectors = {
	block: '.wp-block-coblocks-click-to-tweet',
	tweetContent: '.wp-block-coblocks-click-to-tweet__text',
};

/**
 * Represents the Click to Tweet coblock.
 */
export class ClicktoTweetBlock {
	// Static properties.
	static blockName = 'Click to Tweet';
	static blockEditorSelector = '[aria-label="Block: Click to Tweet"]';
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
	 * Given a text string, enters the text into the main tweet body.
	 *
	 * @param {string} text Content to be tweeted.
	 * @returns {Promise<void>} No return value.
	 */
	async enterTweetContent( text: string ): Promise< void > {
		const textArea = await this.block.waitForSelector( selectors.tweetContent );
		await textArea.fill( text );
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 * @param {(string|number)} contents Contents used to validate the block.
	 * @returns {Promise<void>} No return value.
	 */
	static async validatePublishedContent(
		page: Page,
		contents: ( string | number )[]
	): Promise< void > {
		for await ( const content of contents ) {
			await page.waitForSelector( `${ selectors.block } :text("${ content.toString() }")` );
		}
	}
}
