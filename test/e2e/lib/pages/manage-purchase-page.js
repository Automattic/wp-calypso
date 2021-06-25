/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class ManagePurchasePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.manage-purchase.main' ) );
	}

	async _postInit() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.is-placeholder' )
		);
	}

	async domainDisplayed() {
		return await this.driver.findElement( By.css( '.manage-purchase__title' ) ).getText();
	}

	async chooseCancelAndRefund() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.manage-purchase a[href$="cancel"]' )
		);
	}

	async chooseRenewNow() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.manage-purchase button.is-card-link' )
		);
	}
}
