/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class NoticesComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wpcom-site' ), null, config.get( 'explicitWaitMS' ) * 3 );
	}

	async _isNoticeDisplayed( locator, actionLocator, click = false ) {
		const isDisplayed = await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			locator
		);
		if ( click === true ) {
			await driverHelper.clickWhenClickable( this.driver, actionLocator );
		}
		return isDisplayed;
	}

	async isSuccessNoticeDisplayed( click = false ) {
		const locator = By.css( '.notice.is-success' );
		const actionLocator = By.css( '.notice.is-success a' );
		return await this._isNoticeDisplayed( locator, actionLocator, click );
	}

	async isNoticeDisplayed( click = false ) {
		const locator = By.css( '.notice' );
		const actionLocator = By.css( '.notice a' );
		return await this._isNoticeDisplayed( locator, actionLocator, click );
	}

	async isErrorNoticeDisplayed() {
		const locator = By.css( '.notice.is-error' );
		return await driverHelper.isElementEventuallyLocatedAndVisible( this.driver, locator );
	}

	async getNoticeContent() {
		const locator = By.css( '.notice .notice__text' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
		return await this.driver.findElement( locator ).getText();
	}

	async dismissNotice() {
		const locator = By.css( '.notice.is-dismissable .notice__dismiss' );
		return await driverHelper.clickWhenClickable( this.driver, locator );
	}
}
