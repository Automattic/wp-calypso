import path from 'path';
import { ElementHandle, Page } from 'playwright';
import { waitForElementEnabled, clickNavTab } from '../../element-helper';

const selectors = {
	// Gallery view
	gallery: '.media-library__content',
	items: '.media-library__list-item',
	placeholder: '.is-placeholder',
	editButton: 'button[data-e2e-button="edit"]',
	fileInput: 'input.media-library__upload-button-input',
	uploadRejectionNotice: 'text=/could not be uploaded/i',

	// Modal view
	mediaModal: '.editor-media-modal__content',
	mediaModalEditButton:
		'.editor-media-modal-detail__edition-bar .editor-media-modal-detail__edit:visible',
	mediaModalPreview: '.editor-media-modal-detail__preview',

	// Editor view
	imageEditorCanvas: '.image-editor__canvas-container',
	imageEditorToolbarButton: '.image-editor__toolbar-button',
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
	 * Given that a gallery item is selected, enter the edit screen.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async editImage(): Promise< void > {
		await this.waitUntilLoaded();

		await this.page.click( selectors.editButton );
		await this.page.click( selectors.mediaModalEditButton );
		await this.page.waitForSelector( selectors.imageEditorCanvas );
	}

	/**
	 * Rotates the image.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async rotateImage(): Promise< void > {
		await this.page.waitForSelector( selectors.imageEditorCanvas );
		const selector = `${ selectors.imageEditorToolbarButton } span:text("Rotate")`;
		await this.page.click( selector );
		await waitForElementEnabled( this.page, selectors.imageEditorResetButton );
	}

	/**
	 * Cancels the image editing process and returns to the media modal.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async cancelImageEdit(): Promise< void > {
		await this.page.click( selectors.imageEditorCancelButton );
		await this.page.waitForSelector( selectors.mediaModal );
	}

	/**
	 * Uploads the file to the Media gallery.
	 *
	 * @param {string} fullPath Full path to the file on disk.
	 * @returns {Promise<void>} No return value.
	 */
	async upload( fullPath: string ): Promise< ElementHandle > {
		await this.waitUntilLoaded();

		const filename = path.basename( fullPath );
		const itemSelector = `figure[title="${ filename }"]`;

		await this.page.waitForSelector( selectors.fileInput );
		// Simulate the action of user selecting a file then clicking confirm.
		await this.page.setInputFiles( selectors.fileInput, fullPath );

		// Wait until the spinner for the file being uploaded is hidden.
		// This is necessary as Simple and Atomic sites behave slightly differently when rejecting.
		// For Atomic, a figure and associated spinner are shown briefly in the gallery before rejection.
		await this.page.waitForSelector( `${ itemSelector } .media-library__list-item-spinner`, {
			state: 'hidden',
		} );

		// At this point, if the rejection notice is visible, it means the file was not a supported
		// file type. Throw the error containing the rejection banner text for handling.
		if ( await this.page.isVisible( selectors.uploadRejectionNotice ) ) {
			throw new Error(
				await this.page
					.waitForSelector( selectors.uploadRejectionNotice )
					.then( ( element ) => element.innerText() )
			);
		} else {
			return await this.page.waitForSelector( itemSelector );
		}
	}
}
