import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThankYouModalComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.current-plan-thank-you' ) );
	}

	async continue() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( ".current-plan-thank-you a[href*='my-plan']" )
		);
	}
}
