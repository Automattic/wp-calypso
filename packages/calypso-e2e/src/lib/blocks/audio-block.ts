import { Page, ElementHandle, Response } from 'playwright';

const selectors = {
	block: '.wp-block-audio',
	fileInput: '.components-form-file-upload input[type="file"]',
};

/**
 * Represents the Audio block.
 */
export class AudioBlock {
	static blockName = 'Audio';
	static blockEditorSelector = '[aria-label="Block: Audio"]';
	page: Page;
	block: ElementHandle;

	/**
	 * Constructs an instance of this block.
	 *
	 * @param {Page} page The underlying page object.
	 * @param {ElementHandle} block Handle referencing the block as inserted on the Gutenberg editor.
	 */
	constructor( page: Page, block: ElementHandle ) {
		this.page = page;
		this.block = block;
	}

	/**
	 * Uploads the target file at the supplied path to WPCOM.
	 *
	 * @param {string} path Path to the file on disk.
	 */
	async upload( path: string ): Promise< void > {
		const input = await this.block.waitForSelector( selectors.fileInput, { state: 'attached' } );
		// Wait for the upload request to complete rather than for a spinner to hide.
		// The page-level `.components-spinner` also matches the editor's "Uploading…"
		// snackbar, which can linger after the block itself has finished uploading.
		// Match the upload POST specifically so an unrelated media GET can't resolve early.
		await Promise.all( [
			this.page.waitForResponse(
				( response: Response ) =>
					response.request().method() === 'POST' &&
					response.url().includes( 'media?' ) &&
					response.ok()
			),
			input.setInputFiles( path ),
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
