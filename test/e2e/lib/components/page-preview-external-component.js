/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import ViewPagePage from '../../lib/pages/view-page-page.js';
import * as driverHelper from '../driver-helper.js';

const explicitWaitMS = config.get( 'explicitWaitMS' );
const previewWindowMainSelector = By.css( '#main' );

export default class PagePreviewExternalComponent extends AsyncBaseContainer {
	constructor( driver ) {
		PagePreviewExternalComponent.switchToWindow( driver );
		super( driver, previewWindowMainSelector );
	}

	async pageTitle() {
		this.viewPagePage = await ViewPagePage.Expect( this.driver );
		return await this.viewPagePage.pageTitle();
	}

	async pageContent() {
		this.viewPagePage = await ViewPagePage.Expect( this.driver );
		return await this.viewPagePage.pageContent();
	}

	async imageDisplayed( fileDetails ) {
		this.viewPagePage = await ViewPagePage.Expect( this.driver );
		return await this.viewPagePage.imageDisplayed( fileDetails );
	}

	async close() {
		this.driver.close();
		const handles = await this.driver.getAllWindowHandles();
		this.driver.switchTo().window( handles[ 0 ] );
	}

	async isDisplayed() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			previewWindowMainSelector,
			explicitWaitMS
		);
	}

	static async switchToWindow( driver ) {
		const handles = await driver.getAllWindowHandles();
		await driver.switchTo().window( handles[ 1 ] );
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			previewWindowMainSelector,
			explicitWaitMS
		);
	}
}
