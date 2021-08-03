import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class DomainsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.domain-management-list__items' ) );
	}

	async clickAddDomain() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.add-domain-button' ) );
	}

	async clickPopoverItem( name ) {
		const itemLocator = driverHelper.createTextLocator( By.css( '.popover__menu-item' ), name );
		return await driverHelper.clickWhenClickable( this.driver, itemLocator );
	}
}
