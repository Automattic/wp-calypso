// This is the site view shown after clicking on the site name from side bar

/**
 * External dependencies
 */
import { By as by, until } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class SiteViewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.main .web-preview__frame' ) );
	}

	async isWebPreviewPresent() {
		await this.driver.switchTo().defaultContent();
		return await driverHelper.isElementPresent(
			this.driver,
			by.css( '.main .web-preview__external' )
		);
	}

	async isOpenInNewWindowButtonPresent() {
		await this.driver.switchTo().defaultContent();
		return await driverHelper.isElementPresent(
			this.driver,
			by.css( '.main .web-preview__toolbar .web-preview__external' )
		);
	}

	async isSitePresent() {
		await SiteViewComponent.switchToIFrame( this.driver );
		return await driverHelper.isElementPresent( this.driver, by.css( 'body.home' ) );
	}

	async selectSearchAndSocialPreview() {
		await this.driver.switchTo().defaultContent();
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.main .web-preview__device-switcher' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'a[data-e2e-title="seo"]' )
		);
	}

	async close() {
		await this.driver.switchTo().defaultContent();
		return await driverHelper.clickWhenClickable( this.driver, by.css( '.web-preview__close' ) );
	}

	static async switchToIFrame( driver ) {
		const iFrameSelector = by.css( '.web-preview__frame' );
		const explicitWaitMS = config.get( 'explicitWaitMS' );
		driver.switchTo().defaultContent();
		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			by.css( '.web-preview__inner.is-loaded' )
		);
		return await driver.wait(
			until.ableToSwitchToFrame( iFrameSelector ),
			explicitWaitMS,
			'Could not switch to web preview iFrame'
		);
	}
}
