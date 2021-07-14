import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class PaypalCheckoutPage extends AsyncBaseContainer {
	constructor( driver ) {
		const priceLocator = By.css( '.paypal-checkout-sandbox-iframe' );
		super( driver, priceLocator );
		this.priceLocator = priceLocator;
	}

	async priceDisplayed() {
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, this.priceLocator );
		return await this.driver.findElement( this.priceLocator ).getText();
	}
}
