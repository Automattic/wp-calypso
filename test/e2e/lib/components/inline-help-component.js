/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import assert from 'assert';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

const searchInputSelector = By.css( '.inline-help__popover input[type="search"]' );


class InlineHelpComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.inline-help' ) );
	}

	async isToggleVisible() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.inline-help__button' ) );
	}

	async isPopoverVisible() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.inline-help__popover' ) );
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

export default InlineHelpComponent;
