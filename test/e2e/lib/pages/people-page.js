/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as DriverHelper from '../driver-helper.js';

export default class PeoplePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-people' ) );
		this.searchButtonSelector = By.css( '.section-nav__panel div.search' );
		this.searchInputSelector = By.css( '.section-nav__panel input.search__input' );
		this.searchResultsLoadingSelector = By.css( '.people-profile.is-placeholder' );
		this.peopleListItemSelector = By.css( '.people-list-item' );
	}

	async selectTeam() {
		await DriverHelper.ensureMobileMenuOpen( this.driver );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=team]' )
		);
	}

	async selectViewers() {
		await DriverHelper.ensureMobileMenuOpen( this.driver );
		await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=viewers]' )
		);
		return await this.waitForSearchResults();
	}

	async selectEmailFollowers() {
		await DriverHelper.ensureMobileMenuOpen( this.driver );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=email-followers]' )
		);
	}

	async selectFollowers() {
		await DriverHelper.ensureMobileMenuOpen( this.driver );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*="people/followers"]' )
		);
	}

	async selectInvites() {
		await DriverHelper.ensureMobileMenuOpen( this.driver );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*="people/invites"]' )
		);
	}

	async viewerDisplayed( username ) {
		let retries = 0;
		if (
			await DriverHelper.isElementPresent( this.driver, By.css( '.section-header__label .count' ) )
		) {
			const noOfViewers = parseInt(
				await this.driver.findElement( By.css( '.section-header__label .count' ) ).getText()
			);
			retries = Math.round( noOfViewers / 10 );
		}

		let displayed;
		for ( let i = 0; i <= retries; i++ ) {
			displayed = await DriverHelper.isEventuallyPresentAndDisplayed(
				this.driver,
				By.css( `.people-profile__login[data-e2e-login="${ username }"]` ),
				500
			);
			if ( displayed ) {
				break;
			} else {
				await DriverHelper.scrollIntoView( this.driver, By.css( '.layout__primary' ), 'end' );
			}
		}
		return displayed;
	}

	async removeUserByName( username ) {
		await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( `.people-list-item__remove-button[data-e2e-remove-login="${ username }"]` )
		);
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog button.is-primary' )
		);
	}

	async searchForUser( username ) {
		// This has to be a username without the @
		await this.ensureSearchOpened();
		await DriverHelper.setWhenSettable( this.driver, this.searchInputSelector, username );
		return await this.waitForSearchResults();
	}

	async ensureSearchOpened() {
		const searchElement = await this.driver.findElement( this.searchButtonSelector );
		const classNames = await searchElement.getAttribute( 'class' );
		if ( classNames.includes( 'is-open' ) === false ) {
			await DriverHelper.clickWhenClickable( this.driver, this.searchButtonSelector );
		}
		return await DriverHelper.waitTillPresentAndDisplayed( this.driver, this.searchInputSelector );
	}

	async waitForSearchResults() {
		return await DriverHelper.waitTillNotPresent( this.driver, this.searchResultsLoadingSelector );
	}

	async numberSearchResults() {
		const peopleItems = await this.driver.findElements( this.peopleListItemSelector );
		return peopleItems.length;
	}

	async selectOnlyPersonDisplayed() {
		return await DriverHelper.clickWhenClickable( this.driver, this.peopleListItemSelector );
	}

	async inviteUser() {
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.people-list-section-header__add-button' )
		);
	}

	async waitForPendingInviteDisplayedFor( emailAddress ) {
		const driver = this.driver;
		return await driver.wait( async () => {
			driver.navigate().refresh();
			return await DriverHelper.isElementPresent(
				driver,
				By.css( `.people-invites__pending .people-profile__username[title="${ emailAddress }"]` )
			);
		}, this.explicitWaitMS * 2 );
	}

	async goToRevokeInvitePage( emailAddress ) {
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( `.people-invites__pending .people-profile__username[title="${ emailAddress }"]` )
		);
	}

	async removeOnlyEmailFollowerDisplayed() {
		await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.people-list-item__remove-button' )
		);
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog button.is-primary' )
		);
	}

	async cancelSearch() {
		const cancelSelector = By.css( 'div[aria-label="Close Search"] svg' );
		return await DriverHelper.clickWhenClickable( this.driver, cancelSelector );
	}
}
