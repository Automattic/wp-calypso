/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../../driver-helper';
import GutenbergEditorComponent from '../../../gutenberg/gutenberg-editor-component';

/**
 * A flow class for the shared set of actions among media-based blocks. For future growth, anything
 * specific to a block should go in that block POM class, and anything shared can be added here to keep it DRY.
 */
export default class MediaBlockFlows {
	constructor( driver ) {
		this.driver = driver;
	}

	/**
	 * Flow for directly uploading an image to image-based blocks (e.g. Cover, Image) using the hidden input field.
	 *
	 * @param {string} parentBlockSelector A CSS selector that identifies the parent block element
	 * @param {Object} fileDetails A MediaHelper file details object for the image file to upload
	 */
	async uploadImage( parentBlockSelector, fileDetails ) {
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( `${ parentBlockSelector } .components-form-file-upload` )
		);

		const filePathInput = await this.driver.findElement(
			By.css( `${ parentBlockSelector } .components-form-file-upload input[type="file"]` )
		);
		await filePathInput.sendKeys( fileDetails.file );

		await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( `${ parentBlockSelector } .components-spinner` )
		);
	}

	/**
	 * Wait for the Media Library dialog to open in the editor. The workflows to open the Media Library
	 * dialog vary a lot between blocks, but become shared once the dialog is open, which is why the flows
	 * start at that point.
	 */
	async waitForMediaLibraryDialog() {
		// It's in top iframe, not the editor's!
		await this.driver.switchTo().defaultContent();
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.dialog__content .media-library' )
		);
	}

	/**
	 * Interact with an open Media Library dialog in the editor to upload and insert an image.
	 *
	 * @param {Object} fileDetails A MediaHelper file details object for the image file to upload
	 */
	async uploadAndSelectImageInMediaLibraryDialog( fileDetails ) {
		await this.waitForMediaLibraryDialog();

		const filePathInput = await this.driver.findElement(
			By.css( '.media-library__upload-button-input' )
		);
		await filePathInput.sendKeys( fileDetails.file );
		await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.media-library__list-item.is-selected.is-transient' )
		);

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button[data-e2e-button=confirm]' )
		);
		await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.dialog__content .media-library' )
		);
		// return back to iframe in the editor
		await GutenbergEditorComponent.Expect( this.driver );
	}
}
