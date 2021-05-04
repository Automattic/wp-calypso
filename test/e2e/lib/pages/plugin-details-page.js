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
		this.successNoticeLocator = by.css( '.notice.is-success.is-dismissable' );
		this.activatePluginLocator = by.css( '.plugin-activate-toggle .components-form-toggle' );
	}

	async clickActivateToggleForPlugin() {
		return await driverHelper.clickWhenClickable( this.driver, this.activatePluginLocator );
	}

	async waitForPlugin() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			this.activatePluginLocator
		);
	}

	async waitForSuccessNotice() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			this.successNoticeLocator
		);
	}

	async getSuccessNoticeText() {
		return await this.driver.findElement( this.successNoticeLocator ).getText();
	}

	async ensureDeactivated() {
		const element = await this.driver.findElement( this.activatePluginLocator );
		const active = await element.isDisplayed( by.css( '.is-checked' ) );
		if ( active === true ) {
			await driverHelper.clickWhenClickable( this.driver, this.activatePluginLocator );
			await this.waitForSuccessNotice();
		}
	}

	async goBack() {
		return await driverHelper.clickWhenClickable( this.driver, by.css( '.header-cake__back' ) );
	}
}
