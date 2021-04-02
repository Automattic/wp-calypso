/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class PluginDetailsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.plugin__page' ) );
		this.successNoticeSelector = by.css( '.notice.is-success.is-dismissable' );
		this.activatePluginSelector = by.css( '.plugin-activate-toggle .components-form-toggle' );
	}

	async clickActivateToggleForPlugin() {
		return await driverHelper.clickWhenClickable( this.driver, this.activatePluginSelector );
	}

	async waitForPlugin() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			this.activatePluginSelector
		);
	}

	async waitForSuccessNotice() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			this.successNoticeSelector
		);
	}

	async getSuccessNoticeText() {
		return await this.driver.findElement( this.successNoticeSelector ).getText();
	}

	async ensureDeactivated() {
		const element = await this.driver.findElement( this.activatePluginSelector );
		const active = await element.isDisplayed( by.css( '.is-checked' ) );
		if ( active === true ) {
			await driverHelper.clickWhenClickable( this.driver, this.activatePluginSelector );
			await this.waitForSuccessNotice();
		}
	}

	async goBack() {
		return await driverHelper.clickWhenClickable( this.driver, by.css( '.header-cake__back' ) );
	}
}
