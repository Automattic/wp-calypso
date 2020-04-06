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

	async _isNoticeDisplayed( selector, actionSelector, click = false ) {
		const isDisplayed = await driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
		if ( click === true ) {
			await driverHelper.clickWhenClickable( this.driver, actionSelector );
		}
		return isDisplayed;
	}

	async isSuccessNoticeDisplayed( click = false ) {
		const selector = By.css( '.notice.is-success' );
		const actionSelector = By.css( '.notice.is-success a' );
		return await this._isNoticeDisplayed( selector, actionSelector, click );
	}

	async isNoticeDisplayed( click = false ) {
		const selector = By.css( '.notice' );
		const actionSelector = By.css( '.notice a' );
		return await this._isNoticeDisplayed( selector, actionSelector, click );
	}

	async isErrorNoticeDisplayed() {
		const selector = By.css( '.notice.is-error' );
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	async getNoticeContent() {
		const selector = By.css( '.notice .notice__text' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return await this.driver.findElement( selector ).getText();
	}

	async dismissNotice() {
		const selector = By.css( '.notice.is-dismissable .notice__dismiss' );
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			selector,
			this.explicitWaitMS * 3
		);
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}
}
