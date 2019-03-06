/** @format */

import { By } from 'selenium-webdriver';

import * as DriverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class DomainDetailsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'main.domain-management-edit' ) );
	}

	async viewPaymentSettings() {
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.subscription-settings' )
		);
	}
}
