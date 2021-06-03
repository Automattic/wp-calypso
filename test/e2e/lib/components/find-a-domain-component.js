/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as slackNotifier from '../slack-notifier';
import * as driverHelper from '../driver-helper.js';

const searchInputLocator = By.className( 'search-component__input' );

export default class FindADomainComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.register-domain-step' ) );
		this.declineGoogleAppsLinkLocator = By.className( 'gsuite-upsell-card__skip-button' );
	}

	async waitForResults() {
		const driver = this.driver;
		const resultsLoadingLocator = By.css( '.domain-suggestion.is-placeholder' );
		return await driverHelper.waitUntilElementNotLocated(
			driver,
			resultsLoadingLocator,
			this.explicitWaitMS * 2
		);
	}

	async getSearchInputValue() {
		return await this.driver.findElement( searchInputLocator ).getAttribute( 'value' );
	}

	async searchForBlogNameAndWaitForResults( blogName ) {
		await driverHelper.setWhenSettable( this.driver, searchInputLocator, blogName );
		return await this.waitForResults();
	}

	async checkAndRetryForFreeBlogAddresses( expectedBlogAddresses, blogName ) {
		const self = this;
		const actualAddress = await self.freeBlogAddress();
		if ( expectedBlogAddresses.indexOf( actualAddress ) < 0 ) {
			const message = `The displayed free blog address: '${ actualAddress }' was not in the expected addresses: '${ expectedBlogAddresses }'. Re-searching for '${ blogName }' now.`;
			slackNotifier.warn( message );
			await self.searchForBlogNameAndWaitForResults( blogName );
		}
	}

	async freeBlogAddress() {
		const freeBlogAddressLocator = By.css(
			'.domain-search-results__domain-suggestions > .domain-suggestion .domain-registration-suggestion__title'
		);
		return await this.driver.findElement( freeBlogAddressLocator ).getText();
	}

	async selectDomainAddress( domainAddress ) {
		const locator = By.css( `[data-e2e-domain="${ domainAddress }"]` );
		return await driverHelper.clickWhenClickable( this.driver, locator );
	}

	async selectFreeAddress() {
		const freeAddressLocator = By.css(
			'.domain-search-results__domain-suggestions > .domain-suggestion.is-clickable'
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			freeAddressLocator,
			this.explicitWaitMS
		);
	}

	async selectUseOwnDomain() {
		const useOwnDomain = By.css( '.domain-suggestion.card.domain-transfer-suggestion' );
		return await driverHelper.clickWhenClickable( this.driver, useOwnDomain, this.explicitWaitMS );
	}

	async skipSuggestion() {
		// currently used in 'launch-site' and 'new-launch' signup flows
		const skipSuggestion = By.css( '.domain-skip-suggestion > .button.domain-suggestion__action' );
		return await driverHelper.clickWhenClickable(
			this.driver,
			skipSuggestion,
			this.explicitWaitMS
		);
	}

	async declineGoogleApps() {
		await driverHelper.clickWhenClickable(
			this.driver,
			this.declineGoogleAppsLinkLocator,
			this.explicitWaitMS
		);
		try {
			await driverHelper.waitUntilElementNotLocated(
				this.driver,
				this.declineGoogleAppsLinkLocator
			);
		} catch ( err ) {
			//Sometimes the first click doesn't work. Clicking again
			await driverHelper.clickWhenClickable( this.driver, this.declineGoogleAppsLinkLocator );
		}
	}

	async selectPreviousStep() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.previous-step' ),
			this.explicitWaitMS
		);
	}
}
