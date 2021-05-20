/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class DomainDetailsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.domain-management-header' ) );
	}

	async viewPaymentSettings() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.subscription-settings' )
		);
	}

	async cancelDomain() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a svg.material-icon-delete' )
		);
	}
}
