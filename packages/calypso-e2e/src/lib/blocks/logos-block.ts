import { Page, ElementHandle } from 'playwright';

const selectors = {
	block: '.wp-block-coblocks-logos',
	fileInput: '.components-form-file-upload input[type="file"]',
	spinner: '.components-spinner',

	imageTitleData: ( filename: string ) =>
		`${ selectors.block } img[data-image-title*="${ filename }" i]`,
};

/**
 * Represents the Logos coblock.
 */
export class LogosBlock {
	static blockName = 'Logos';
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
	 * @param {string} contents Contents used to validate the block.
	 * @returns {Promise<void>} No return value.
	 */
	static async validatePublishedContent( page: Page, contents: string[] ): Promise< void > {
		for await ( const content of contents ) {
			await page.waitForSelector( selectors.imageTitleData( content ) );
		}
	}
}
