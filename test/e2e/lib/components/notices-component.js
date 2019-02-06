/** @format */

import { By } from 'selenium-webdriver';

import config from 'config';

import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class NoticesComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#notices' ), null, config.get( 'explicitWaitMS' ) * 3 );
	}

	async inviteMessageTitle() {
		const selector = By.css( '.invite-message__title' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return await this.driver.findElement( selector ).getText();
	}

	async followMessageTitle() {
		const selector = By.css( '#notices .notice__text' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return await this.driver.findElement( selector ).getText();
	}
}
