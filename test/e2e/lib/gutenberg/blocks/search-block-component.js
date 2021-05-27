/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class SearchBlockComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wp-block-search' ) );
	}

	async searchBlockVisible() {
		const textLocator = By.css( '.wp-block-search' );
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, textLocator );
	}

	async searchLabelVisible() {
		const textLocator = By.css( '.wp-block-search__label' );
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, textLocator );
	}

	async searchInputVisible() {
		const textLocator = By.css( '.wp-block-search__input' );
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, textLocator );
	}

	async searchButtonVisible() {
		const textLocator = By.css( '.wp-block-search__button' );
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, textLocator );
	}
}
