/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

const by = webdriver.By;

export default class StoreProductsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.products__list' ) );
	}

	async atLeastOneProductDisplayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.products__list-wrapper tr.has-action' )
		);
	}

	async productDisplayed( productTitle ) {
		return await driverHelper.verifyTextPresent(
			this.driver,
			by.css( '.products__list-name' ),
			productTitle
		);
	}

	async selectProduct( productTitle ) {
		return await driverHelper.selectElementByText(
			this.driver,
			by.css( '.products__list-name' ),
			productTitle
		);
	}
}
