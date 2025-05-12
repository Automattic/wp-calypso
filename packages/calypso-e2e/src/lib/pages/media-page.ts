import { ElementHandle, Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { waitForElementEnabled, clickNavTab } from '../../element-helper';

const selectors = {
	// Gallery view
	gallery: '.media-library__content',
	items: ( selected: boolean ) => {
		if ( selected ) {
			return '.media-library__list-item.is-selected';
		}
		return '.media-library__list-item';
	},
	placeholder: '.is-placeholder',
	uploadSpinner: '.media-library__list-item-spinner',
	notReadyOverlay: '.is-transient',
	editButton: 'button[data-e2e-button="edit"]',
	deleteButton: '.media-library__header button[data-e2e-button="delete"]',
	fileInput: 'input.media-library__upload-button-input',
	uploadRejectionNotice: 'text=/could not be uploaded/i',

	// Edit File modal
	editFileModal: '.editor-media-modal__content',
	editImageButton: 'button:has-text("Edit Image"):visible',
	editModalDeleteButton: '.editor-media-modal button:has-text("Delete"):visible',

	// Popup confirmation
	confirmationDeleteButton: '.dialog:has-text("Are you sure") button:has-text("Delete")',

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
	 * Opens the Media page.
	 *
	 * Example {@link https://wordpress.com/media}
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto( getCalypsoURL( `media/${ siteSlug }` ) );
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
	 * Checks whether the storage capacity for Media files is
	 * as expected.
	 *
	 * @param {number} capacity Expected capacity in GB (gigabytes).
	 */
	async hasStorageCapacity( capacity: number ): Promise< boolean > {
		const locator = this.page.locator(
			`.plan-storage__storage-label:has-text("${ capacity.toString() }")`
		);
		try {
			await locator.waitFor( { timeout: 15 * 1000 } );
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Given either a 1-indexed number `n` or the file name, click and select the item.
	 *
	 * Note that if an index is passed and the media gallery has been
	 * filtered (eg. Images only), this method will select the `nth`
	 * item in the filtered gallery as shown.
	 *
	 * @param param0 Keyed object parameter.
	 * @param {number} param0.index 1-indexed value denoting the nth media gallery item to be selected.
	 * @param {string} param0.name Filename of the media gallery item to be selected.
	 * @throws {Error} If requested item could not be located in the gallery, or if the click action failed to select the gallery item.
	 */
	async selectItem( { index, name }: { index?: number; name?: string } = {} ): Promise< void > {
		if ( ! index && ! name ) {
			throw new Error( 'Specify either index or name.' );
		}

		if ( index ) {
			const elementHandle = await this.page.waitForSelector(
				`:nth-match(${ selectors.items }, ${ index })`
			);
			await elementHandle.click();
			await this.page.waitForFunction(
				( element: SVGElement | HTMLElement ) => element.classList.contains( 'is-selected' ),
				elementHandle
			);
		}
		if ( name ) {
			const locator = this.page.locator( selectors.items( false ), {
				has: this.page.locator( `figure[title="${ name }"]` ),
			} );
			await locator.click();

			const selectedLocator = this.page.locator( selectors.items( true ), {
				has: this.page.locator( `figure[title="${ name }"]` ),
			} );
			await selectedLocator.waitFor();
		}
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
			await this.page.waitForSelector( selectors.items( true ) );
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
	 * Delete the current selected media from the edit modal. Assumes the modal is open.
	 */
	async deleteMediaFromModal(): Promise< void > {
		const modalDeleteButtonLocator = this.page.locator( selectors.editModalDeleteButton );
		await modalDeleteButtonLocator.click();

		const confirmationDeleteButtonLocator = this.page.locator( selectors.confirmationDeleteButton );
		await confirmationDeleteButtonLocator.click();
	}

	/**
	 * Delete all currently selected media from the main media library page.
	 */
	async deleteSelectedMediaFromLibrary(): Promise< void > {
		const deleteButtonLocator = this.page.locator( selectors.deleteButton );
		await deleteButtonLocator.click();

		const confirmationDeleteButtonLocator = this.page.locator( selectors.confirmationDeleteButton );
		await confirmationDeleteButtonLocator.click();
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
