/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';
import * as dataHelper from '../data-helper';

export default class ThemesPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, by.css( 'a.theme__thumbnail img' ), url );
	}

	static getStartURL() {
		return dataHelper.getCalypsoURL( 'themes' );
	}

	async showOnlyFreeThemes() {
		return await this.showOnlyThemesType( 'free' );
	}

	async showOnlyPremiumThemes() {
		return await this.showOnlyThemesType( 'premium' );
	}

	async showOnlyThemesType( type ) {
		await this.openShowcase();
		await driverHelper.clickWhenClickable( this.driver, by.css( `a[data-e2e-value="${ type }"]` ) );
		return await this.waitUntilThemesLoaded();
	}

	async selectNewTheme() {
		// select first theme from the list
		return await driverHelper.clickWhenClickable( this.driver, by.css( '.theme__content' ) );
	}

	async selectNewThemeStartingWith( phrase ) {
		const locator = ThemesPage._getThemeSelectionXpath( phrase );
		return await driverHelper.clickWhenClickable( this.driver, locator );
	}

	async waitUntilThemesLoaded() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			by.css( '.themes-list .is-placeholder' )
		);
	}

	async waitForThemeStartingWith( phrase ) {
		const locator = ThemesPage._getThemeSelectionXpath( phrase );
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
	}

	async clickNewThemeMoreButton() {
		const locator = by.css( '.theme-showcase__all-themes .is-actionable:not(.is-active) button' );

		await driverHelper.scrollIntoView( this.driver, locator );
		return await driverHelper.clickWhenClickable( this.driver, locator );
	}

	async getFirstThemeName() {
		const locator = by.css( '.theme-showcase__all-themes .is-actionable:not(.is-active) h2' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
		return await this.driver.findElement( locator ).getText();
	}

	async getActiveThemeName() {
		const locator = by.css( '.is-actionable.is-active h2' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
		return await this.driver.findElement( locator ).getText();
	}

	async searchFor( phrase ) {
		const searchToggleLocator = by.css( '.themes-magic-search-card div.search' );
		const searchFieldLocator = by.css( '.themes-magic-search-card input.search__input' );
		await driverHelper.clickWhenClickable( this.driver, searchToggleLocator, this.explicitWaitMS );
		await driverHelper.setWhenSettable( this.driver, searchFieldLocator, phrase );
		await this.driver.findElement( searchFieldLocator ).sendKeys( ' ' );
		return await this.waitUntilThemesLoaded();
	}

	async clickPopoverItem( name ) {
		const actionItemLocator = by.css( '.popover__menu-item' );
		return await driverHelper.selectElementByText( this.driver, actionItemLocator, name );
	}

	async popOverMenuDisplayed() {
		const popOverMenuLocator = by.css( '.popover__menu' );
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			popOverMenuLocator
		);
	}

	static _getThemeSelectionXpath( phrase ) {
		const lowerCasedPhrase = phrase.toLowerCase().replace( ' ', '-' );
		return by.css( `div[data-e2e-theme*='${ lowerCasedPhrase }']:not(.is-active)` );
	}

	async clearSearch() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.themes-magic-search-card__icon-close' )
		);
	}

	async openShowcase() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( `button[data-e2e-value="open-themes-button"]` )
		);
	}
}
