/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	// Gallery view
	gallery: '.media-frame-content',
	items: '.attachments li',

	// Item clicked view
	editButton: '.edit-attachment',

	// Image edit view
	imageEditor: '.image-editor',
	imagePreview: '.imgedit-crop-wrap img',
	undoButton: 'imgedit-undo',
	rotateButton: '.imgedit-r',
	cancelButton: '.imgedit-cancel-btn',
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
	 * Given a 1-indexed number `n`, click on the nth item in the media gallery.
	 *
	 * @param {[key: string]: number } param0 Parameter object.
	 * @param {number} param0.item nth media gallery item to be selected.
	 * @returns {Promise<void>} No return value.
	 * @throws {Error} If media gallery contains less items than the requested item.
	 */
	async click( { item }: { item: number } ): Promise< void > {
		const items = await this.page.$$( selectors.items );

		if ( item > items.length ) {
			throw new Error(
				`Was requested item ${ item } but only ${ items.length } items in the media gallery.`
			);
		}

		const target = items[ item - 1 ];
		await target.click();
	}

	/**
	 * Clicks on the edit image button to enter image editor.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async editImage(): Promise< void > {
		await this.page.click( selectors.editButton );
		await this.page.waitForSelector( selectors.imageEditor );
	}

	/**
	 * Rotates the image.
	 *
	 * @param {[key: string]: string } param0 Parameter object.
	 * @param {string} param0.direction Rotation direction specified by either left or right.
	 * @returns {Promise<void>} No return value.
	 */
	async rotateImage( { direction }: { direction: 'left' | 'right' } ): Promise< void > {
		const preview = await this.page.waitForSelector( selectors.imagePreview );
		const selector = `${ selectors.rotateButton }${ direction }`;
		await this.page.click( selector );
		await preview.waitForElementState( 'stable' );
		const undoButton = await this.page.waitForSelector( selectors.undoButton );
		await undoButton.isEnabled();
	}

	/**
	 * Cancels the image editing process and returns to the image view screen.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async cancelEdit(): Promise< void > {
		const cancelButton = await this.page.waitForSelector( selectors.cancelButton );
		await cancelButton.click();
	}
}
