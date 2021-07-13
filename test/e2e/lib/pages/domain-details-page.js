import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

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
