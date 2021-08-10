import { Page, ElementHandle } from 'playwright';

const selectors = {
	block: '.wp-block-image',
	fileInput: '.components-form-file-upload input[type="file"]',
	spinner: '.components-spinner',
};

/**
 * Represents the Image block.
 */
export class ImageBlock {
	static blockName = 'Image';
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
		// The `input` element has a display:none style set and it cannot be found normally even if
		// waitForSelector({state: 'hidden'}) is used.
		const input = ( await this.block.$( selectors.fileInput ) ) as ElementHandle;
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
	 * @param {(string|number)} contents Contents used to validate the block.
	 * @returns {Promise<void>} No return value.
	 */
	static async validatePublishedContent(
		page: Page,
		contents: ( string | number )[]
	): Promise< void > {
		for await ( const content of contents ) {
			// Use the attribute CSS selector to perform partial match.
			// If a file with the same name already exists in the Media Gallery, this clash is resolved by
			// appending a numerical postfix (eg. <original-filename>-2).
			await page.waitForSelector( `${ selectors.block } img[data-image-title*="${ content }" i]` );
		}
	}
}
