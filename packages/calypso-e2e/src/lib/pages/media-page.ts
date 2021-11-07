import { ElementHandle, Page } from 'playwright';
import { waitForElementEnabled, clickNavTab } from '../../element-helper';

const selectors = {
	// Gallery view
	gallery: '.media-library__content',
	items: '.media-library__list-item',
	selectedItems: '.media-library__list-item.is-selected',
	placeholder: '.is-placeholder',
	uploadSpinner: '.media-library__list-item-spinner',
	notReadyOverlay: `.is-transient`,
	editButton: 'button[data-e2e-button="edit"]',
	deleteButton: 'button[data-e2e-button="delete"]',
	fileInput: 'input.media-library__upload-button-input',
	uploadRejectionNotice: 'text=/could not be uploaded/i',

	// Edit File modal
	editFileModal: '.editor-media-modal__content',
	editImageButton: 'button:has-text("Edit Image"):visible',

	// Iamge Editor
	imageEditorCanvas: '.image-editor__canvas-container',
	imageEditorToolbarButton: ( text: string ) =>
		`.image-editor__toolbar-button span:text("${ text }")`,
	imageEditorResetButton: 'button[data-e2e-button="reset"]',
	imageEditorCancelButton: 'button[data-e2e-button="cancel"]',
};

/**
 * Represents an instance of the WPCOM Media library page.
 */
export class MediaPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Waits until the Media page gallery is loaded and ready.
	 */
	async waitUntilLoaded(): Promise< ElementHandle > {
		// Wait for all placeholders to disappear.
		// Alternatively, waiting for `networkidle` will achieve the same objective
		// at the cost of much longer resolving time (~20s).
		await this.page.waitForSelector( selectors.placeholder, { state: 'hidden' } );

		const gallery = await this.page.waitForSelector( selectors.gallery );
		await gallery.waitForElementState( 'stable' );
		return gallery;
	}

	/**
	 * Given a 1-indexed number `n`, click and select the nth item in the media gallery.
	 *
	 * Note that if the media gallery has been filtered (eg. Images only), this method
	 * will select the `nth` item in the filtered gallery as shown.
	 *
	 * @param {number} index 1-indexed value denoting the nth media gallery item to be selected.
	 * @returns {Promise<void>} No return value.
	 * @throws {Error} If requested item could not be located in the gallery, or if the click action
	 * failed to select the gallery item.
	 */
	async selectItem( index: number ): Promise< void > {
		// Playwright is able to select the nth matching item given a selector.
		// See https://playwright.dev/docs/selectors#pick-n-th-match-from-the-query-result.
		const elementHandle = await this.page.waitForSelector(
			`:nth-match(${ selectors.items }, ${ index })`
		);
		await elementHandle.click();
		await this.page.waitForFunction(
			( element: any ) => element.classList.contains( 'is-selected' ),
			elementHandle
		);
	}

	/**
	 * Clicks on the navigation tab (desktop) or dropdown (mobile).
	 *
	 * @param {string} name Name of the tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( name: 'All' | 'Images' | 'Documents' | 'Videos' | 'Audio' ): Promise< void > {
		await this.waitUntilLoaded();
		await clickNavTab( this.page, name );
	}

	/**
	 * Launches the edit item modal where file attributes can be modified.
	 *
	 * This method expects at least one gallery element supporting editing
	 * to be selected. If no images are selected, this method will throw.
	 *
	 * @throws {Error} If no gallery items are selected.
	 */
	async editSelectedItem(): Promise< void > {
		// Check that an item has been selected.
		try {
			await this.page.waitForSelector( selectors.selectedItems );
		} catch ( error ) {
			throw new Error( 'Unable to edit files: no item(s) were selected.' );
		}

		await this.page.click( selectors.editButton );
	}

	/**
	 * Launches the image editor from within the edit item modal.
	 *
	 * This option is only available for files that are classified as 'images' in WPCOM.
	 */
	async launchImageEditor(): Promise< void > {
		await this.page.waitForSelector( selectors.editFileModal );
		await this.page.click( selectors.editImageButton );
	}

	/**
	 * Rotates the image.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async rotateImage(): Promise< void > {
		await this.page.waitForSelector( selectors.imageEditorCanvas );
		await this.page.click( selectors.imageEditorToolbarButton( 'Rotate' ) );
		await waitForElementEnabled( this.page, selectors.imageEditorResetButton );
	}

	/**
	 * Cancels the image editing process and returns to the media modal.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async cancelImageEdit(): Promise< void > {
		await this.page.click( selectors.imageEditorCancelButton );
		await this.page.waitForSelector( selectors.editFileModal );
	}

	/**
	 * Uploads the file to the Media gallery.
	 *
	 * @param {string} fullPath Full path to the file on disk.
	 * @returns {Promise<void>} No return value.
	 */
	async upload( fullPath: string ): Promise< void > {
		await this.waitUntilLoaded();

		// Set the file input to the full path of file on disk.
		await this.page.setInputFiles( selectors.fileInput, fullPath );

		await Promise.all( [
			// Delete file button is disabled during uploads.
			this.page.waitForSelector( `${ selectors.deleteButton }[disabled]`, {
				state: 'hidden',
			} ),
			this.page.waitForSelector( selectors.uploadSpinner, { state: 'hidden' } ),
			this.page.waitForSelector( selectors.notReadyOverlay, { state: 'hidden' } ),
		] );

		// For both Simple and Atomic, the rejection banner is shown after the upload progress
		// elements are removed from page.
		const rejected = await this.page.isVisible( selectors.uploadRejectionNotice );

		if ( rejected ) {
			throw new Error(
				await this.page
					.waitForSelector( selectors.uploadRejectionNotice )
					.then( ( element ) => element.innerText() )
			);
		}
	}
}
