import { Page, ElementHandle } from 'playwright';
import { EditorComponent } from '../..';

type Sources = 'Media Library' | 'Google Photos' | 'Pexels';

const selectors = {
	block: '.wp-block-image',

	// Block when no image is selected
	fileInput: '.components-form-file-upload input[type="file"]',
	selectImageSourceButton: 'button.jetpack-external-media-button-menu',
	imageSource: ( source: Sources ) => `button :text("${ source }")`,

	// Published
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
	private editor: EditorComponent;
	block: ElementHandle;

	/**
	 * Constructs an instance of this block.
	 *
	 * @param {Page} page The underlying page object.
	 * @param {ElementHandle} block Handle referencing the block as inserted on the Gutenberg editor.
	 */
	constructor( page: Page, block: ElementHandle ) {
		this.block = block;
		this.editor = new EditorComponent( page );
	}

	/**
	 * @returns {Promise< ElementHandle >} The image element
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
	 * Given path to an image file, uploads the image to an Image block
	 * using the media modal via `Select Images` > `Media Library`.
	 *
	 * @param {string} path Path to the image file.
	 */
	async uploadThroughMediaLibrary( path: string ): Promise< ElementHandle > {
		await this.selectImageSource( 'Media Library' );

		// Note: editorParent() doesn't work in Gutenframe due to the media library's
		// use of a ReactPortal, changing the DOM hierarchy. Instead, we use the
		// expression below, which is compatible with both simple and AT (which is not
		// rendered from Gutenframe).
		const page = ( await this.block.ownerFrame() )?.page() as Page;
		await page.locator( 'input[type="file"][multiple]' ).setInputFiles( path );

		await page.locator( 'button:text-is("Select")' ).click();

		return await this.getImage();
	}

	/**
	 * Click on the `Select Image` button, visible when no image is selected.
	 *
	 * @param {Sources} source Source for the image.
	 */
	async selectImageSource( source: Sources ): Promise< void > {
		const buttonHandle = await this.block.waitForSelector( selectors.selectImageSourceButton );
		await buttonHandle.click();

		const editorParent = await this.editor.parent();
		await editorParent.locator( selectors.imageSource( source ) ).click();
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
