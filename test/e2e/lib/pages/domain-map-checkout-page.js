/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from "../driver-helper";

export default class MapADomainCheckoutPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.checkout__payment-box-container,.composite-checkout' ) );
	}

	async _postInit() {
		const completeCheckoutSelector = By.css( '.checkout-submit-button .checkout-button' );
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, completeCheckoutSelector );
	}
}
