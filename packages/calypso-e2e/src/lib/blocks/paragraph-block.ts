import { Page, ElementHandle } from 'playwright';

const selectors = {
	block: '.wp-block-paragraph',
};

/**
 * Represents the Audio block.
 */
export class ParagraphBlock {
	static blockName = 'Paragraph';
	static blockEditorSelector =
		'[aria-label="Empty block; start writing or type forward slash to choose a block"]';
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
	 * Enters the contents of the `text` parameter.
	 *
	 * @param {string} text Text to be entered into the paragraph.
	 */
	async enterParagraph( text: string ): Promise< void > {
		await this.block.fill( text );
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
