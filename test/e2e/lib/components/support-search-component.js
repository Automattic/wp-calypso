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

const searchInputSelectors = By.css(
	'.inline-help__search input[type="search"], .help-search__search input[type="search"]'
);
const searchResultsSelectors = By.css(
	'.inline-help__results-list .inline-help__results-item, .help-search__results-list .help-search__results-item'
);

class SupportSearchComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.inline-help__search, .help-search__search' ) );
	}

	async waitForResults() {
		const driver = this.driver;
		const resultsLoadingSelector = By.css(
			'.inline-help__results-placeholder, .help-search__results-placeholder'
		);

		return driverHelper.waitTillNotPresent(
			driver,
			resultsLoadingSelector,
			this.explicitWaitMS * 2
		);
	}

	async isRequestingSearchResults() {
		return await driverHelper.isElementPresent(
			this.driver,
			By.css( '.inline-help__results-placeholder' )
		);
	}

	async getSearchResults() {
		return await this.driver.findElements( searchResultsSelectors );
	}

	async getSearchResultsCount() {
		const results = await this.getSearchResults();
		return results.length;
	}

	async searchFor( query = '' ) {
		await driverHelper.setWhenSettable( this.driver, searchInputSelectors, query );
		const val = await this.getSearchInputValue();
		assert.strictEqual( val, query, `Failed to correctly set search input value to ${ query }` );
		return await this.waitForResults();
	}

	async getSearchInputValue() {
		return await this.driver.findElement( searchInputSelectors ).getAttribute( 'value' );
	}

	async clearSearchField() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				'.inline-help__search [role="search"] [aria-label="Close Search"], .help-search__search [role="search"] [aria-label="Close Search"]'
			)
		);
		const val = await this.getSearchInputValue();
		assert.equal( val, '', `Failed to correctly clear search input using clear UI` );
	}

	async hasNoResultsMessage() {
		return await driverHelper.isElementPresent(
			this.driver,
			By.css( '.inline-help__empty-results, .help-search__empty-results' )
		);
	}
}

export default SupportSearchComponent;
