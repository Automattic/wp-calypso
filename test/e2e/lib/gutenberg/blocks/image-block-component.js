/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export class ImageBlockComponent extends GutenbergBlockComponent {
	async uploadImage( fileDetails ) {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.components-form-file-upload ' )
		);
		const filePathInput = await this.driver.findElement(
			By.css( '.components-form-file-upload input[type="file"]' )
		);
		await filePathInput.sendKeys( fileDetails.file );
		return await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.wp-block-image .components-spinner' )
		); // Wait for upload spinner to complete
	}

	async openMediaModal() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.block-editor-media-placeholder' )
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.jetpack-external-media-button-menu' )
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.components-popover__content button.components-menu-item__button:nth-child(1)' )
		);
		await this.driver.switchTo().defaultContent();
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.dialog__content .media-library' )
		);
	}

	async insertImageFromMediaModal( fileDetails ) {
		await this.openMediaModal();
		const filePathInput = await this.driver.findElement(
			By.css( '.media-library__upload-button-input' )
		);
		await filePathInput.sendKeys( fileDetails.file );
		await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.media-library__list-item.is-selected.is-transient' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.button.is-primary[data-tip-target="dialog-base-action-confirm"]' )
		);
	}
}
