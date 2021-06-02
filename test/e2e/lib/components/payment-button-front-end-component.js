/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container.js';

export default class PaymentButtonFrontEndComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-simple-payments-wrapper' ) );
	}

	async _preInit() {
		// The payment button doesn't always show on the page right away. Waiting a few seconds and refreshing fixes it.
		await this.driver.sleep( 5000 );
		return await this.driver.navigate().refresh();
	}

	async clickPaymentButton() {
		const payPalPayButtonLocator = By.css( '.paypal-button-card' );
		await driverHelper.waitUntilAbleToSwitchToFrame(
			this.driver,
			By.css( '.xcomponent-component-frame,.zoid-component-frame' )
		);
		await driverHelper.clickWhenClickable( this.driver, payPalPayButtonLocator );
		await this.driver.switchTo().defaultContent();
	}
}
