/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';

export default class MediaPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.media-library__content' ) );
	}

	async _preInit() {
		return await this.driver.switchTo().defaultContent();
	}

	async selectFirstImage() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.media-library__upload-button' )
		);
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.media-library__list-item:not(.is-placeholder)' )
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.media-library__list-item .is-image' )
		);
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.media-library__list-item.is-selected' )
		);
	}

	async selectEditMedia() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button[data-e2e-button="edit"]' )
		);
	}

	async mediaEditorShowing() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.editor-media-modal' ) );
	}

	async imageShowingInEditor() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.image-editor__crop' )
		);
	}

	async clickEditImage() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.editor-media-modal-detail__sidebar .editor-media-modal-detail__edit' )
			);
		}

		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-media-modal-detail__preview-wrapper .editor-media-modal-detail__edit' )
		);
	}

	async selectInsertImage() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.media-library__list-item.is-selected' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-media-modal button[data-e2e-button="confirm"]' )
		);
	}

	async uploadFile( file ) {
		const fileNameInputSelector = By.css( '.media-library__upload-button input[type="file"]' );
		const driver = this.driver;

		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			By.className( 'media-library__upload-button' )
		);
		const fileNameInput = await driver.findElement( fileNameInputSelector );
		await fileNameInput.sendKeys( file );
		await driverHelper.elementIsNotPresent(
			driver,
			By.css( '.media-library__list-item.is-transient' )
		);
		return await driverHelper.waitTillPresentAndDisplayed(
			driver,
			By.css( '.media-library__list-item.is-selected' )
		);
	}

	async deleteMedia( file ) {
		if (
			await driverHelper.elementIsNotPresent(
				this.driver,
				By.css( '.media-library__list-item.is-selected' )
			)
		) {
			this.selectFirstImage();
		}
		await driverHelper.clickWhenClickable( this.driver, By.css( '.editor-media-modal__delete' ) );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog__backdrop button[data-e2e-button="accept"]' )
		);
	}

	async clickCancel() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-media-modal button[data-e2e-button="cancel"]' )
		);
	}
}
