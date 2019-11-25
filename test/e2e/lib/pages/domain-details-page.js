/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as DriverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class DomainDetailsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.domain-management-header' ) );
	}

	async viewPaymentSettings() {
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.subscription-settings' )
		);
	}
}
