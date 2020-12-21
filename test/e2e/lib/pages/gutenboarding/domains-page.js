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
		const firstDomainSelector = By.css( '.domain-picker__suggestion-item.is-free' );
		return await driverHelper.clickWhenClickable( this.driver, firstDomainSelector );
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
