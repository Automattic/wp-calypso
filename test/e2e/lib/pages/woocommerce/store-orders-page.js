/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../../lib/driver-helper';
import AsyncBaseContainer from '../../async-base-container';

const by = webdriver.By;

export default class StoreOrdersPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.woocommerce .orders__container' ) );
		this.firstOrderSelector = by.css( '.orders__table .table-row.has-action' );
	}

	async atLeastOneOrderDisplayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			this.firstOrderSelector
		);
	}

	async clickFirstOrder() {
		return await driverHelper.clickWhenClickable( this.driver, this.firstOrderSelector );
	}
}
