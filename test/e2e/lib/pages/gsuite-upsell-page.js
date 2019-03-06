/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class GSuiteUpsellPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.gsuite-dialog__checkout-button' ) );
	}

	async declineEmail() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.gsuite-dialog__checkout-button' )
		);
	}
}
