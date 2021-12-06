import { Page, ElementHandle } from 'playwright';

const selectors = {
	block: '.wp-block-image',
	fileInput: '.components-form-file-upload input[type="file"]',
	// Use the attribute CSS selector to perform partial match, beginning with the filename.
	// If a file with the same name already exists in the Media Gallery, WPCOM resolves this clash
	// by appending a numerical postfix (eg. <original-filename>-2).
	image: ( filename: string ) => `${ selectors.block } img[data-image-title*="${ filename }" i]`,
};

/**
 * Represents the Image block.
 */
export class ImageBlock {
	static blockName = 'Image';
	static blockEditorSelector = '[aria-label="Block: Image"]';
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
	 * @returns The image element
	 */
	async getImage(): Promise< ElementHandle > {
		return await this.block.waitForSelector( 'img' );
	}

	/**
	 * Waits for the image to be uploaded.
	 */
	async waitUntilUploaded(): Promise< void > {
		await Promise.all( [
			// Checking spinner isn't enough sometimes, as can be observed with the
			// Logos block: While the spinner has already disappeared, the image is
			// still being uploaded and the block gets refreshed when it's done. Only
			// when the image is properly uploaded, its source is updated (refreshed)
			// from the initial "blob:*" to "https:*". This is what we're checking now
			// to make sure the block is valid and ready to be published.
			this.block.waitForSelector( 'img:not([src^="blob:"])' ),
			this.block.waitForElementState( 'stable' ),
		] );
	}

	/**
	 * Uplaods the target file at the supplied path to WPCOM.
	 *
	 * @param {string} path Path to the file on disk.
	 * @returns The uploaded image element handle.
	 */
	async upload( path: string ): Promise< ElementHandle > {
		const input = await this.block.waitForSelector( 'input[type="file"]', { state: 'attached' } );
		await input.setInputFiles( path );
		await this.waitUntilUploaded();

		return await this.getImage();
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 * @param {(string|number)} contents Contents used to validate the block.
	 * @returns {Promise<void>} No return value.
	 */
	static async validatePublishedContent( page: Page, contents: string[] ): Promise< void > {
		for await ( const content of contents ) {
			await page.waitForSelector( selectors.image( content ) );
		}
	}
}
