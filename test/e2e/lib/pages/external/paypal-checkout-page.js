/** @format */

import { By as by } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class PaypalCheckoutPage extends AsyncBaseContainer {
	constructor( driver ) {
		const priceSelector = by.css( '.formatCurrency' );
		super( driver, priceSelector );
		this.priceSelector = priceSelector;
	}

	async priceDisplayed() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.priceSelector );
		return await this.driver.findElement( this.priceSelector ).getText();
	}
}
