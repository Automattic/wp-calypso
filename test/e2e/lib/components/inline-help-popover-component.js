/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

class InlineHelpPopoverComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.inline-help' ) );
	}

	async waitForToggleNotToBePresent() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.inline-help__button' )
		);
	}

	async isToggleVisible() {
		return await driverHelper.isElementLocated( this.driver, By.css( '.inline-help__button' ) );
	}

	async isPopoverVisible() {
		return await driverHelper.isElementLocated( this.driver, By.css( '.inline-help__popover' ) );
	}

	async toggleOpen() {
		await this.isToggleVisible();
		await driverHelper.clickWhenClickable( this.driver, By.css( '.inline-help__button' ) );
	}

	async toggleClosed() {
		await this.isPopoverVisible();
		await this.isToggleVisible();
		await driverHelper.clickWhenClickable( this.driver, By.css( '.inline-help__button' ) );
	}
}

export default InlineHelpPopoverComponent;
