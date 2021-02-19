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
// A little confusing, but this is specific to the default results and _not_ including the errored results (which are the same results).
// We're checking for the aria-label is set correctly and that the title for the error section is not present.
const defaultResultsSelectors = By.css(
	'[aria-label="Helpful resources for this section"] ul:not([aria-labelledby="inline-search--contextual_help"]) li'
);
const searchResultsSelectors = By.css( '[aria-labelledby="inline-search--api_help"] li' );
const adminSearchResultsSelectors = By.css( '[aria-labelledby="inline-search--admin_section"] li' );
const errorResultsSelectors = By.css( '[aria-labelledby="inline-search--contextual_help"] li' );

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

	async getDefaultResults() {
		return await this.driver.findElements( defaultResultsSelectors );
	}

	async getDefaultResultsCount() {
		const results = await this.getDefaultResults();
		return results.length;
	}

	async waitForDefaultResultsNotToBePresent() {
		return driverHelper.waitTillNotPresent( this.driver, defaultResultsSelectors );
	}

	async getErrorResults() {
		return await this.driver.findElements( errorResultsSelectors );
	}

	async getErrorResultsCount() {
		const results = await this.getErrorResults();
		return results.length;
	}

	async waitForErrorResultsNotToBePresent() {
		return driverHelper.waitTillNotPresent( this.driver, errorResultsSelectors );
	}

	async getSearchResults() {
		return await this.driver.findElements( searchResultsSelectors );
	}

	async getSearchResultsCount() {
		const results = await this.getSearchResults();
		return results.length;
	}

	async waitForSearchResultsNotToBePresent() {
		return driverHelper.waitTillNotPresent( this.driver, searchResultsSelectors );
	}

	async getAdminSearchResults() {
		return await this.driver.findElements( adminSearchResultsSelectors );
	}

	async getAdminSearchResultsCount() {
		const results = await this.getAdminSearchResults();
		return results.length;
	}

	async waitForAdminResultsNotToBePresent() {
		return driverHelper.waitTillNotPresent( this.driver, adminSearchResultsSelectors );
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
