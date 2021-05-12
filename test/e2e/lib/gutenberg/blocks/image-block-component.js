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
		/**
		 * The image block is initially not selected. It has to be though, if we want
		 * to sendKeys to the file input. That's why we're clicking the block title
		 * here.
		 */
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `${ this.blockID } .components-placeholder__label` )
		);

		const filePathInput = await this.driver.findElement(
			By.css( `${ this.blockID } .components-form-file-upload input[type="file"]` )
		);

		await filePathInput.sendKeys( fileDetails.file );
		await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( `${ this.blockID } .components-spinner` )
		); // Wait for upload spinner to complete
	}

	async openMediaModal() {
		await driverHelper.waitUntilElementLocatedAndVisible(
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
		return await driverHelper.waitUntilElementLocatedAndVisible(
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
		await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.media-library__list-item.is-selected.is-transient' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.button.is-primary[data-tip-target="dialog-base-action-confirm"]' )
		);
	}
}
