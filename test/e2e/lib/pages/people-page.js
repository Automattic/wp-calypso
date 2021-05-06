/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import SectionNavComponent from '../components/section-nav-component';

import * as DriverHelper from '../driver-helper.js';

export default class PeoplePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-people' ) );
		this.searchButtonLocator = By.css( '.section-nav__panel div.search' );
		this.searchInputLocator = By.css( '.section-nav__panel input.search__input' );
		this.searchResultsLoadingLocator = By.css( '.people-profile.is-placeholder' );
		this.peopleListItemLocator = By.css( '.people-list-item' );
	}

	async selectTeam() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		await sectionNav.ensureMobileMenuOpen();
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=team]' )
		);
	}

	async selectViewers() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		await sectionNav.ensureMobileMenuOpen();
		await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=viewers]' )
		);
		return await this.waitForSearchResults();
	}

	async selectEmailFollowers() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		await sectionNav.ensureMobileMenuOpen();
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=email-followers]' )
		);
	}

	async selectFollowers() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		await sectionNav.ensureMobileMenuOpen();
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*="people/followers"]' )
		);
	}

	async selectInvites() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		await sectionNav.ensureMobileMenuOpen();
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*="people/invites"]' )
		);
	}

	async viewerDisplayed( username ) {
		let retries = 0;
		if (
			await DriverHelper.isElementLocated( this.driver, By.css( '.section-header__label .count' ) )
		) {
			const noOfViewers = parseInt(
				await this.driver.findElement( By.css( '.section-header__label .count' ) ).getText()
			);
			retries = Math.round( noOfViewers / 10 );
		}

		let displayed;
		for ( let i = 0; i <= retries; i++ ) {
			displayed = await DriverHelper.isElementEventuallyLocatedAndVisible(
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
		await DriverHelper.setWhenSettable( this.driver, this.searchInputLocator, username );
		return await this.waitForSearchResults();
	}

	async ensureSearchOpened() {
		const searchElement = await this.driver.findElement( this.searchButtonLocator );
		const classNames = await searchElement.getAttribute( 'class' );
		if ( classNames.includes( 'is-open' ) === false ) {
			await DriverHelper.clickWhenClickable( this.driver, this.searchButtonLocator );
		}
		return await DriverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			this.searchInputLocator
		);
	}

	async waitForSearchResults() {
		return await DriverHelper.waitUntilElementNotLocated(
			this.driver,
			this.searchResultsLoadingLocator
		);
	}

	async numberSearchResults() {
		const peopleItems = await this.driver.findElements( this.peopleListItemLocator );
		return peopleItems.length;
	}

	async selectOnlyPersonDisplayed() {
		return await DriverHelper.clickWhenClickable( this.driver, this.peopleListItemLocator );
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
			await DriverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( `.people-invites__pending .people-profile__username[title="${ emailAddress }"]` )
			);

			return await DriverHelper.isElementLocated(
				driver,
				By.css( `.people-invites__pending .people-profile__username[title="${ emailAddress }"]` )
			);
		}, this.explicitWaitMS * 10 );
	}

	async goToRevokeInvitePage( emailAddress ) {
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( `.people-invites__pending .people-profile__username[title="${ emailAddress }"]` )
		);
	}

	async goToClearAcceptedInvitePage( username ) {
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( `.people-invites__accepted .people-profile__login[data-e2e-login="${ username }"]` )
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
		const cancelLocator = By.css( 'div[aria-label="Close Search"] svg' );
		return await DriverHelper.clickWhenClickable( this.driver, cancelLocator );
	}
}
