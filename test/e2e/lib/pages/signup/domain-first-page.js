import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class DomainFirstPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-or-domain__choices' ) );
	}

	async chooseJustBuyTheDomain() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.site-or-domain__choice[data-e2e-type="domain"]' )
		);
	}
}
