import { Page, ElementHandle } from 'playwright';

const TYPE_TIMEOUT_PER_CHAR_MS = 250;

/**
 * Represents the Paragraph block.
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
	async enterParagraph( text: string, { type }: { type?: boolean } = {} ): Promise< void > {
		if ( type ) {
			// Each keystroke re-renders the editor; under CI load a 100-char string can
			// take over the 10s action timeout, so budget the timeout per character.
			await this.block.type( text, { timeout: text.length * TYPE_TIMEOUT_PER_CHAR_MS } );
		} else {
			await this.block.fill( text );
		}
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
			await page.locator( `:text("${ content.toString() }"):visible` ).waitFor();
		}
	}
}
