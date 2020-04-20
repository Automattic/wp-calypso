/**
 * External dependencies
 */
import { By, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as slackNotifier from '../slack-notifier';
import * as driverHelper from '../driver-helper.js';

const searchInputSelector = By.className( 'search__input' );

export default class FindADomainComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.register-domain-step' ) );
		this.declineGoogleAppsLinkSelector = By.className( 'gsuite-upsell-card__skip-button' );
	}

	async waitForResults() {
		const driver = this.driver;
		const resultsLoadingSelector = By.css( '.domain-suggestion.is-placeholder' );
		await driver.wait(
			function () {
				return driverHelper
					.isElementPresent( driver, resultsLoadingSelector )
					.then( function ( present ) {
						return ! present;
					} );
			},
			this.explicitWaitMS * 2,
			'The domain results loading element was still present when it should have disappeared by now.'
		);
		return await this.checkForUnknownABTestKeys();
	}

	async waitForGoogleApps() {
		return await this.driver.wait(
			until.elementLocated( this.declineGoogleAppsLinkSelector ),
			this.explicitWaitMS,
			'Could not locate the link to decline google apps.'
		);
	}

	async getSearchInputValue() {
		return await this.driver.findElement( searchInputSelector ).getAttribute( 'value' );
	}

	async searchForBlogNameAndWaitForResults( blogName ) {
		await driverHelper.setWhenSettable( this.driver, searchInputSelector, blogName );
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
		const freeBlogAddressSelector = By.css(
			'.domain-search-results__domain-suggestions > .domain-suggestion .domain-registration-suggestion__title'
		);
		return await this.driver.findElement( freeBlogAddressSelector ).getText();
	}

	async selectDomainAddress( domainAddress ) {
		const selector = By.css( `[data-e2e-domain="${ domainAddress }"]` );
		await this.driver.wait(
			until.elementLocated( selector ),
			this.explicitWaitMS,
			'Could not locate the select button for the paid address: ' + domainAddress
		);
		const element = await this.driver.findElement( selector );
		await this.driver.wait(
			until.elementIsEnabled( element ),
			this.explicitWaitMS,
			'The paid address button for ' + domainAddress + ' does not appear to be enabled to click'
		);
		return await driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}

	async selectFreeAddress() {
		const freeAddressSelector = By.css(
			'.domain-search-results__domain-suggestions > .domain-suggestion.is-clickable'
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			freeAddressSelector,
			this.explicitWaitMS
		);
	}

	async selectUseOwnDomain() {
		const useOwnDomain = By.css( '.domain-suggestion.card.domain-transfer-suggestion' );
		return await driverHelper.clickWhenClickable( this.driver, useOwnDomain, this.explicitWaitMS );
	}

	async declineGoogleApps() {
		await driverHelper.clickWhenClickable(
			this.driver,
			this.declineGoogleAppsLinkSelector,
			this.explicitWaitMS
		);
		try {
			await driverHelper.waitTillNotPresent( this.driver, this.declineGoogleAppsLinkSelector );
		} catch ( err ) {
			//Sometimes the first click doesn't work. Clicking again
			await driverHelper.clickWhenClickable( this.driver, this.declineGoogleAppsLinkSelector );
		}
	}

	selectPreviousStep() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.previous-step' ),
			this.explicitWaitMS
		);
	}
}
