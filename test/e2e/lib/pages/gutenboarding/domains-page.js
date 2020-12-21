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
		return await driverHelper.isElementPresent(
			this.driver,
			By.css( '.domain-picker__empty-state' )
		);
	}

	async selectFreeDomain() {
		const freeDomainButtonSelector = By.css( '.domain-picker__suggestion-item.is-free' );
		const freeDomainNameSelector = By.css(
			'.domain-picker__suggestion-item.is-free .domain-picker__suggestion-item-name'
		);
		await driverHelper.waitTillPresentAndDisplayed( this.driver, freeDomainNameSelector );
		const domainNameElement = await this.driver.findElement( freeDomainNameSelector );
		const domainName = await domainNameElement.getText();
		await driverHelper.clickWhenClickable( this.driver, freeDomainButtonSelector );
		return domainName;
	}

	async continueToNextStep() {
		const nextButtonSelector = By.css( '.action-buttons__next' );
		return await driverHelper.clickWhenClickable( this.driver, nextButtonSelector );
	}

	async skipStep() {
		const skipButtonSelector = By.css( '.action-buttons__skip' );
		return await driverHelper.clickWhenClickable( this.driver, skipButtonSelector );
	}

	async enterDomainQuery( query ) {
		const searchFieldSelector = By.css( '.domain-picker__search input[type="text"]' );
		return await driverHelper.setWhenSettable( this.driver, searchFieldSelector, query );
	}
}
