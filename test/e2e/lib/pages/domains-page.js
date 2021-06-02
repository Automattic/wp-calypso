/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
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
		const actionItemLocator = driverHelper.createTextLocator(
			By.css( '.popover__menu-item' ),
			name
		);
		return await driverHelper.clickWhenClickable( this.driver, actionItemLocator );
	}

	async popOverMenuDisplayed() {
		const popOverMenuLocator = By.css( '.popover__menu' );
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			popOverMenuLocator
		);
	}
}
