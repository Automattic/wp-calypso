/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class GSuiteUpsellPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.gsuite-upsell-card__skip-button' ) );
	}

	async declineEmail() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.gsuite-upsell-card__skip-button' )
		);
	}
}
