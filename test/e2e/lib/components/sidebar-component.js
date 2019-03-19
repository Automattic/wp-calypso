/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';
import DisconnectSurveyPage from '../pages/disconnect-survey-page.js';
import * as driverHelper from '../driver-helper.js';

export default class SidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.sidebar' ) );
		this.storeSelector = By.css( '.menu-link-text[data-e2e-sidebar="Store"]' );
	}

	async selectDomains() {
		return await this._scrollToAndClickMenuItem( 'domains' );
	}

	async selectPeople() {
		return await this._scrollToAndClickMenuItem( 'people' );
	}

	async selectAddPerson() {
		return await this._scrollToAndClickMenuItem( 'people', { clickButton: true } );
	}

	async selectManagePlugins() {
		return await this._scrollToAndClickMenuItem( 'side-menu-plugins', { clickButton: true } );
	}

	async selectThemes() {
		return await this._scrollToAndClickMenuItem( 'themes', { clickButton: true } );
	}

	async customizeTheme() {
		return await this._scrollToAndClickMenuItem( 'themes' );
	}

	async selectPlan() {
		return await this._scrollToAndClickMenuItem( 'plan' );
	}

	async selectAddNewPage() {
		return await this._scrollToAndClickMenuItem( 'side-menu-page', { clickButton: true } );
	}

	async selectStats() {
		return await this._scrollToAndClickMenuItem( 'menus' );
	}

	async selectActivity() {
		return await this._scrollToAndClickMenuItem( 'activity' );
	}

	async selectViewThisSite() {
		return await this._scrollToAndClickMenuItem( 'sitePreview' );
	}

	async selectPlugins() {
		return await this._scrollToAndClickMenuItem( 'side-menu-plugins' );
	}

	async selectSettings() {
		return await this._scrollToAndClickMenuItem( 'settings' );
	}

	async selectMedia() {
		return await this._scrollToAndClickMenuItem( 'side-menu-media' );
	}

	async selectImport() {
		return await this._scrollToAndClickMenuItem( 'side-menu-import' );
	}

	async selectPages() {
		return await this._scrollToAndClickMenuItem( 'side-menu-page' );
	}

	async selectPosts() {
		return await this._scrollToAndClickMenuItem( 'side-menu-post' );
	}

	async selectComments() {
		return await this._scrollToAndClickMenuItem( 'side-menu-comments' );
	}

	async selectStoreOption() {
		return await driverHelper.clickWhenClickable( this.driver, this.storeSelector );
	}

	async storeOptionDisplayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.storeSelector );
	}

	async settingsOptionExists() {
		return await driverHelper.isElementPresent(
			this.driver,
			SidebarComponent._getSidebarSelector( 'settings' )
		);
	}

	async mediaOptionExists() {
		return await driverHelper.isElementPresent(
			this.driver,
			SidebarComponent._getSidebarSelector( 'side-menu-media' )
		);
	}

	async numberOfMenuItems() {
		let elements = await this.driver.findElements( By.css( '.sidebar .sidebar__menu li' ) );
		return elements.length;
	}

	async _scrollToAndClickMenuItem( target, { clickButton = false } = {} ) {
		const selector = SidebarComponent._getSidebarSelector( target, { getButton: clickButton } );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.site__notices' ) );
		await driverHelper.scrollIntoView( this.driver, selector );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	static _getSidebarSelector( target, { getButton = false } = {} ) {
		const linkSelector = getButton ? 'a.sidebar__button' : 'a:not(.sidebar__button)';
		return By.css( `.sidebar li[data-tip-target="${ target }"] ${ linkSelector }` );
	}

	async ensureSidebarMenuVisible() {
		const allSitesSelector = By.css( '.current-section a' );
		const sidebarSelector = By.css( '.sidebar .sidebar__region' );
		const sidebarVisible = await this.driver.findElement( sidebarSelector ).isDisplayed();

		if ( ! sidebarVisible ) {
			await driverHelper.clickWhenClickable( this.driver, allSitesSelector );
		}
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, sidebarSelector );
	}

	async selectSiteSwitcher() {
		const siteSwitcherSelector = By.css( '.current-site__switch-sites' );
		await this.ensureSidebarMenuVisible();
		const present = await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			siteSwitcherSelector,
			1000
		);
		if ( present ) {
			return await driverHelper.clickWhenClickable( this.driver, siteSwitcherSelector );
		}
		return false;
	}

	async searchForSite( searchString ) {
		const searchSelector = By.css( '.site-selector input[type="search"]' );
		const siteSelector = By.css( `.site-selector .site a[aria-label*="${ searchString }"]` );

		const searchElement = await this.driver.findElement( searchSelector );
		const searchEnabled = await searchElement.isDisplayed();

		if ( searchEnabled ) {
			await driverHelper.setWhenSettable( this.driver, searchSelector, searchString );
		}
		return await driverHelper.clickWhenClickable( this.driver, siteSelector );
	}

	async selectAllSites() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.all-sites a' ) );
	}

	async addNewSite() {
		await this.ensureSidebarMenuVisible();

		const sidebarNewSiteButton = By.css( '.my-sites-sidebar__add-new-site' );
		const siteSwitcherNewSiteButton = By.css( '.site-selector__add-new-site .button svg' );
		let present = await driverHelper.isElementPresent( this.driver, sidebarNewSiteButton );
		if ( present ) {
			return await driverHelper.clickWhenClickable( this.driver, sidebarNewSiteButton );
		}
		await this.selectSiteSwitcher();

		return await driverHelper.clickWhenClickable( this.driver, siteSwitcherNewSiteButton );
	}

	/**
	 * Removes a single jetpack site with error label from the sites list.
	 *
	 * @return {Promise<boolean>} true if a site was removed
	 */
	async removeBrokenSite() {
		const siteSwitcherSelector = By.css( '.current-site__switch-sites' );
		const brokenSiteButton = By.css( '.is-error .site-indicator__button' );
		const disconnectJetpackButton = By.css( '.site-indicator__action a[href*="disconnect-site"]' );
		const clearSearchButton = By.css( '.search__close-icon' );

		await this.ensureSidebarMenuVisible();
		const foundSwitcher = await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			siteSwitcherSelector
		);
		if ( ! foundSwitcher ) {
			// no site switcher, only one site
			return false;
		}
		await this.selectSiteSwitcher();
		let clearSearch = await driverHelper.isElementPresent( this.driver, clearSearchButton );
		if ( clearSearch ) {
			await driverHelper.clickWhenClickable( this.driver, clearSearchButton );
		}
		let foundBroken = await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			brokenSiteButton
		);
		if ( ! foundBroken ) {
			// no broken sites
			return false;
		}
		await driverHelper.clickWhenClickable( this.driver, brokenSiteButton );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, disconnectJetpackButton );
		await driverHelper.clickWhenClickable( this.driver, disconnectJetpackButton );
		const surveyPage = await DisconnectSurveyPage.Expect( this.driver );
		await surveyPage.skipSurveyAndDisconnectSite();
		// Necessary to drive the loop forward
		return true;
	}

	async selectSite( siteName ) {
		const siteSelector = By.css( `.site__content[title='${ siteName }']` );
		const siteSwitcherSelector = By.css( '.current-site__switch-sites' );

		await this.ensureSidebarMenuVisible();
		const foundSwitcher = await driverHelper.isElementPresent( this.driver, siteSwitcherSelector );
		if ( ! foundSwitcher ) {
			// no site switcher, only one site
			return false;
		}
		await this.selectSiteSwitcher();
		const site = await driverHelper.isElementPresent( this.driver, siteSelector );
		if ( ! site ) {
			// site is not in present in list
			return false;
		}
		return await driverHelper.clickWhenClickable( this.driver, siteSelector );
	}
}
