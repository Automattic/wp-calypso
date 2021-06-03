/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import ViewPagePage from '../../lib/pages/view-page-page.js';
import * as driverHelper from '../driver-helper.js';

export default class PagePreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.web-preview.is-visible' ) );
	}

	async _preInit() {
		await this._switchToDefaultContent();
	}

	async _postInit() {
		await this._switchToPreviewFrame();
		this.viewPagePage = await ViewPagePage.Expect( this.driver );
	}

	async _switchToPreviewFrame() {
		await this._switchToDefaultContent();
		const frameLocator = By.css( '.web-preview__frame' );
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, frameLocator );
	}

	async _switchToDefaultContent() {
		await this.driver.switchTo().defaultContent();
	}

	async pageTitle() {
		await this._switchToPreviewFrame();
		return this.viewPagePage.pageTitle();
	}

	async pageContent() {
		await this._switchToPreviewFrame();
		return this.viewPagePage.pageContent();
	}

	async imageDisplayed( fileDetails ) {
		await this._switchToPreviewFrame();
		return this.viewPagePage.imageDisplayed( fileDetails );
	}

	async close() {
		await this._switchToDefaultContent();
		const closeButtonLocator = By.css( 'button.web-preview__close' );
		await driverHelper.clickWhenClickable( this.driver, closeButtonLocator );
	}

	async edit() {
		await this._switchToDefaultContent();
		const editButtonLocator = By.css( '.button.web-preview__edit' );
		await driverHelper.clickWhenClickable( this.driver, editButtonLocator );
	}
}
