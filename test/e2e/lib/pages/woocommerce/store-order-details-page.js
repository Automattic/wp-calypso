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

export default class StoreOrderDetailsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.woocommerce .order__container' ) );
	}

	async clickFirstProduct() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.woocommerce .order-details__item-link' )
		);
	}
}
