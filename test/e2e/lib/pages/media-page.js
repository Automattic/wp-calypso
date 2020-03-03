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

	async selectFirstImage() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.media-library__upload-button' )
		);
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.media-library__list-item:not(.is-placeholder)' )
		);
		await driverHelper.clickWhenClickable( this.driver, By.css( '.media-library__list-item' ) );
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
}
