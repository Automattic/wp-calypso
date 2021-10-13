import { Page, ElementHandle, Response, Frame } from 'playwright';

const selectors = {
	block: '.wp-block-file',
	fileInput: '.components-form-file-upload input[type="file"]',
	loadingAnimation: '.components-animate__loading.is-transient',
};

/**
 * Represents the File block.
 */
export class FileBlock {
	static blockName = 'File';
	static blockEditorSelector = '[aria-label="Block: File"]';
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
		// Obtain the page that this block resides on by first obtaining the frame then the page on which
		// the frame belongs to.
		const frame = ( await this.block.ownerFrame() ) as Frame;
		const page = frame.page() as Page;

		const input = await this.block.waitForSelector( selectors.fileInput, { state: 'attached' } );
		// Wait for the request complete instead of looking for the spinner and/or loading animation.
		// Waiting on the animation class to be detached is not a reliable method for this block.
		// It can lead to the filename placeholder text not being replaced with the uploaded file name.
		await Promise.all( [
			page.waitForResponse(
				( response: Response ) => response.url().includes( 'media?' ) && response.status() === 200
			),
			input.setInputFiles( path ),
		] );
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 * @param {(string|number)} contents Contents used to validate the block.
	 * @returns {Promise<void>} No return value.
	 */
	static async validatePublishedContent( page: Page, contents: string[] ): Promise< void > {
		await page.waitForSelector( 'a:text("Download")' );
		for await ( const content of contents ) {
			await page.waitForSelector( `a:has-text("${ content }")` );
		}
	}
}
