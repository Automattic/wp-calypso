import { Page, ElementHandle } from 'playwright';

const selectors = {
	block: '.wp-block-audio',
	fileInput: '.components-form-file-upload input[type="file"]',
	spinner: '.components-spinner',
};

/**
 * Represents the Audio block.
 */
export class AudioBlock {
	static blockName = 'Audio';
	static blockEditorSelector = '[aria-label="Block: Audio"]';
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
	 * Uplaods the target file at the supplied path to WPCOM.
	 *
	 * @param {string} path Path to the file on disk.
	 */
	async upload( path: string ): Promise< void > {
		const input = await this.block.waitForSelector( selectors.fileInput, { state: 'attached' } );
		await input.setInputFiles( path );
		await Promise.all( [
			this.block.waitForSelector( selectors.spinner, { state: 'hidden' } ),
			this.block.waitForElementState( 'stable' ),
		] );
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 * @returns {Promise<void>} No return value.
	 */
	static async validatePublishedContent( page: Page ): Promise< void > {
		await page.waitForSelector( `${ selectors.block } audio` );
	}
}
