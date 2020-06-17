/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import assert from 'assert';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

const searchInputSelector = By.css( '.inline-help__popover input[type="search"]' );

class InlineHelpComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.inline-help' ) );
	}

	async waitForResults() {
		const driver = this.driver;
		const resultsLoadingSelector = By.css( '.inline-help__results-placeholder' );
		return await driver.wait(
			function () {
				return driverHelper
					.isElementPresent( driver, resultsLoadingSelector )
					.then( function ( present ) {
						return ! present;
					} );
			},
			this.explicitWaitMS * 2,
			'The support search loading element was still present when it should have disappeared by now.'
		);
	}

	async isToggleVisible() {
		return await this.driver.findElement( By.css( '.inline-help__button' ) );
	}

	async isPopoverVisible() {
		return await this.driver.findElement( By.css( '.inline-help__popover' ) );
	}

	async toggleOpen() {
		await this.isToggleVisible();
		await driverHelper.clickWhenClickable( this.driver, By.css( '.inline-help__button' ) );
		return await this.isPopoverVisible();
	}

	async getSearchResults() {
		return await this.driver.findElements(
			By.css( '.inline-help__results-list .inline-help__results-item' )
		);
	}

	async searchFor( query = '' ) {
		await driverHelper.setWhenSettable( this.driver, searchInputSelector, query );
		const val = await this.getSearchInputValue();
		assert.strictEqual( val, query, `Failed to correctly set search input value to ${ query }` );
		return await this.waitForResults();
	}

	async getSearchInputValue() {
		return await this.driver.findElement( searchInputSelector ).getAttribute( 'value' );
	}
}

export default InlineHelpComponent;
