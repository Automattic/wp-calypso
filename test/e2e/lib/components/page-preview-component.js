/** @format */

import { By, until } from 'selenium-webdriver';
import config from 'config';

import AsyncBaseContainer from '../async-base-container';

import ViewPagePage from '../../lib/pages/view-page-page.js';
import * as driverHelper from '../driver-helper.js';

export default class PagePreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		PagePreviewComponent.switchToIFrame( driver );
		super( driver, By.css( '#main' ) );
	}

	async _postInit() {
		return await this.driver.switchTo().defaultContent();
	}

	async pageTitle() {
		await PagePreviewComponent.switchToIFrame( this.driver );
		this.viewPagePage = await ViewPagePage.Expect( this.driver );
		return await this.viewPagePage.pageTitle();
	}

	async pageContent() {
		await PagePreviewComponent.switchToIFrame( this.driver );
		this.viewPagePage = await ViewPagePage.Expect( this.driver );
		return await this.viewPagePage.pageContent();
	}

	async imageDisplayed( fileDetails ) {
		await PagePreviewComponent.switchToIFrame( this.driver );
		this.viewPagePage = await ViewPagePage.Expect( this.driver );
		return await this.viewPagePage.imageDisplayed( fileDetails );
	}

	async close() {
		await this.driver.switchTo().defaultContent();
		let closeButton = await this.driver.findElement( By.css( 'button.web-preview__close' ) );
		return await this.driver.executeScript( 'arguments[0].click()', closeButton );
	}

	async edit() {
		await this.driver.switchTo().defaultContent();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.button.web-preview__edit' )
		);
	}

	static async switchToIFrame( driver ) {
		const iFrameSelector = By.css( '.web-preview__frame' );
		const explicitWaitMS = config.get( 'explicitWaitMS' );
		await driver.switchTo().defaultContent();
		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			By.css( '.web-preview__inner.is-visible.is-loaded' )
		);
		return driver.wait(
			until.ableToSwitchToFrame( iFrameSelector ),
			explicitWaitMS,
			'Could not switch to web preview iFrame'
		);
	}
}
