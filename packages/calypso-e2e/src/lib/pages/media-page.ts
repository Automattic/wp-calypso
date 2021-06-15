/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	// Navigation tabs
	navtabs: '.section-nav-tabs',

	// Gallery view
	gallery: '.media-library__content',
	items: '.media-library__list-item',
	editButton: 'button[data-e2e-button="edit"]',

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
	 * Given a 1-indexed number `n`, click on the nth item in the media gallery.
	 *
	 * If the media gallery has been filtered (eg. Images only), this method will select the
	 * `nth` item in the filtered gallery.
	 *
	 * @param {[key: string]: number } param0 Parameter object.
	 * @param {number} param0.item nth media gallery item to be selected.
	 * @returns {Promise<void>} No return value.
	 * @throws {Error} If requested item could not be located in the gallery. Alternatively,
	 * if the click action failed to select the gallery item.
	 */
	async clickOn( { item }: { item: number } ): Promise< void > {
		// Playwright is able to select the nth matching item given a selector.
		// See https://playwright.dev/docs/selectors#pick-n-th-match-from-the-query-result.
		const element = await this.page.waitForSelector(
			`:nth-match(${ selectors.items }, ${ item })`
		);

		if ( ! element ) {
			throw new Error(
				`Requested item number ${ item } is greater than number of items in gallery.`
			);
		}

		await element.waitForElementState( 'visible' );
		await element.click();
		await element.waitForElementState( 'stable' );
		const isSelected = await element.evaluate( ( node ) =>
			node.classList.contains( 'is-selected' )
		);
		if ( ! isSelected ) {
			throw new Error( `Failed to select requested item number ${ item }` );
		}
	}

	/**
	 * Clicks on the navigation tab.
	 *
	 * @param {[key: string]: string } param0 Parameter object.
	 * @param {string} param0.name Name of the tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( {
		name,
	}: {
		name: 'All' | 'Images' | 'Documents' | 'Videos' | 'Audio';
	} ): Promise< void > {
		await this.page.waitForSelector( selectors.navtabs );
		await this.page.click( `${ selectors.navtabs } span:has-text("${ name }")` );
		// Wait for all placeholders to disappear.
		// Alternatively, waiting for `networkidle` will achieve the same objective
		// at the cost of much longer resolving time (~20s).
		await this.page.waitForSelector( '.is-placeholder', { state: 'hidden' } );
	}

	/**
	 * Given that a gallery item is selected, enter the edit screen.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async editImage(): Promise< void > {
		await this.page.click( selectors.editButton );
		await this.page.waitForSelector( selectors.mediaModalPreview );
		await this.page.click( selectors.mediaModalEditButton );
		await this.page.waitForSelector( selectors.imageEditorCanvas );
	}

	/**
	 * Rotates the image.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async rotateImage(): Promise< void > {
		const preview = await this.page.waitForSelector( selectors.imageEditorCanvas );
		const selector = `${ selectors.imageEditorToolbarButton } span:text("Rotate")`;
		await this.page.click( selector );
		await preview.waitForElementState( 'stable' );
		const undoButton = await this.page.waitForSelector( selectors.imageEditorResetButton );
		await undoButton.isEnabled();
	}

	/**
	 * Cancels the image editing process and returns to the media modal.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async cancelImageEdit(): Promise< void > {
		const cancelButton = await this.page.waitForSelector( selectors.imageEditorCancelButton );
		await cancelButton.click();
	}
}
