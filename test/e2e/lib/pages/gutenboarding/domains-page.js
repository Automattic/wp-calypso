/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class DomainsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.domains' ) );
	}

	async isInEmptyState() {
		return await driverHelper.isElementLocated(
			this.driver,
			By.css( '.domain-picker__empty-state' )
		);
	}

	async enterDomainQuery( query ) {
		const searchFieldLocator = By.css( '.domain-picker__search input[type="text"]' );
		await driverHelper.setWhenSettable( this.driver, searchFieldLocator, query );
		// After typing the new query value, wait for domain suggestions to reload.
		// The sleep value should be higher than the DOMAIN_SEARCH_DEBOUNCE_INTERVAL defined in domain-picker.
		// https://github.com/Automattic/wp-calypso/blob/trunk/packages/domain-picker/src/constants.ts#L18
		await this.driver.sleep( 400 );
	}

	async waitForDomainSuggestionsToLoad() {
		const placeholderLocator = By.css( '.domain-picker__suggestion-item.placeholder' );
		await driverHelper.waitUntilElementNotLocated( this.driver, placeholderLocator );
	}

	/**
	 * Get the free domain name from the list of search results
	 *
	 * @returns {Promise<string>} The free domain
	 */
	async getFreeDomainName() {
		const freeDomainNameLocator = By.css(
			'.domain-picker__suggestion-item.is-free .domain-picker__suggestion-item-name'
		);
		const domainNameElement = await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			freeDomainNameLocator
		);
		return await domainNameElement.getText();
	}

	async selectFreeDomain() {
		const freeDomainButtonLocator = By.css( '.domain-picker__suggestion-item.is-free' );
		await driverHelper.clickWhenClickable( this.driver, freeDomainButtonLocator );
	}

	async continueToNextStep() {
		const nextButtonLocator = By.css( '.action-buttons__next' );
		return await driverHelper.clickWhenClickable( this.driver, nextButtonLocator );
	}

	async skipStep() {
		const skipButtonLocator = By.css( '.action-buttons__skip' );
		return await driverHelper.clickWhenClickable( this.driver, skipButtonLocator );
	}
}
