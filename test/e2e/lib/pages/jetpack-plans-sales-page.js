/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class JetpackPlansSalesPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.cta-install #btn-mast-getstarted' ) );
	}

	async clickPurchaseButton() {
		const selector = By.css( '.cta-install #btn-mast-getstarted' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}
}
