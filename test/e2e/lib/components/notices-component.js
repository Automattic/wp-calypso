/** @format */

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
		super( driver, By.css( '.notice' ), null, config.get( 'explicitWaitMS' ) * 3 );
	}

	async successNoticeDisplayed() {
		const selector = By.css( '.notice.is-success' );
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
	}

	async errorNoticeDisplayed() {
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
		await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async clickSuccessNotice() {
		const selector = By.css( '.notice.is-success a' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async inviteNoticeContent() {
		const selector = By.css( '.notice .invites__title' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return await this.driver.findElement( selector ).getText();
	}
}
