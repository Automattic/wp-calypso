/**
 * External dependencies
 */
import path from 'path';

/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';
import { waitForElementEnabled } from '../../element-helper';

/**
 * Type dependencies
 */
import { ElementHandle, Page } from 'playwright';

const selectors = {
	// Navigation tabs
	navTabs: '.section-nav-tabs',
	navTabsDropdownOptions: '.select-dropdown__option',

	// Gallery view
	gallery: '.media-library__content',
	items: '.media-library__list-item',
	placeholder: '.is-placeholder',
	editButton: 'button[data-e2e-button="edit"]',
	addNewButton: 'input[type="file"]',
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
 *
 * @augments {BaseContainer}
 */
export class MediaPage extends BaseContainer {
	/**
	 * Constructs an instance of the MediaPage object.
	 *
	 * @param {Page} page Underlying page on which interactions take place.
	 */
	constructor( page: Page ) {
		super( page, selectors.gallery );
	}

	/**
	 * Post-initialization steps.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		await this.page.waitForLoadState( 'domcontentloaded' );
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
		const navTabs = await this.page.waitForSelector( selectors.navTabs );
		const gallery = await this.page.waitForSelector( selectors.gallery );
		const isDropdown = await navTabs
			.getAttribute( 'class' )
			.then( ( value ) => value?.includes( 'is-dropdown' ) );
		if ( isDropdown ) {
			// Mobile view - navtabs become a dropdown.
			await navTabs.click();
			await this.page.click( `${ selectors.navTabsDropdownOptions } >> text=${ name }` );
		} else {
			// Desktop view - navtabs are constantly visible tabs.
			await this.page.click( `${ selectors.navTabs } >> text=${ name }` );
		}
		// Wait for all placeholders to disappear.
		// Alternatively, waiting for `networkidle` will achieve the same objective
		// at the cost of much longer resolving time (~20s).
		await this.page.waitForSelector( selectors.placeholder, { state: 'hidden' } );
		await gallery.waitForElementState( 'stable' );
	}

	/**
	 * Given that a gallery item is selected, enter the edit screen.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async editImage(): Promise< void > {
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
		// Simulate the user selecting a file and confirming.
		await this.page.setInputFiles( selectors.addNewButton, fullPath );

		// From here, confirm if upload is successful or rejected.
		const filename = path.basename( fullPath );
		// Item in gallery have the `title=<filename>` attribute.
		const itemSelector = `figure[title="${ filename }"]`;
		const result = await Promise.race( [
			this.page.waitForSelector( itemSelector ), // Upload successful
			this.page.waitForSelector( selectors.uploadRejectionNotice ), // Upload failed
		] );

		// If the promise resolved to a result with `title` attribute, upload was successful.
		if ( ( await result.getAttribute( 'title' ) ) === filename ) {
			return result;
		}
		// Otherwise, throw the content of the error banner to the caller for further processing.
		throw new Error( await result.innerText() );
	}
}
