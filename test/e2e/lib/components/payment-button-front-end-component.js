/** @format */

import { By as by, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container.js';

export default class PaymentButtonFrontEndComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-simple-payments-wrapper' ) );
	}

	async clickPaymentButton() {
		const payPalPayButtonSelector = by.css( '.paypal-button-card' );
		await this.driver.wait(
			until.ableToSwitchToFrame( by.css( '.xcomponent-component-frame,.zoid-component-frame' ) ),
			this.explicitWaitMS,
			'Could not locate the payment button iFrame.'
		);
		await driverHelper.waitTillPresentAndDisplayed( this.driver, payPalPayButtonSelector );
		await driverHelper.clickWhenClickable( this.driver, payPalPayButtonSelector );
		return await this.driver.switchTo().defaultContent();
	}
}
