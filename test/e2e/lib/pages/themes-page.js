/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';
import * as dataHelper from '../data-helper';

export default class ThemesPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( 'a.theme__thumbnail img' ), url );
	}

	static _getThemeSelectionXpath( phrase ) {
		const lowerCasedPhrase = phrase.toLowerCase().replace( ' ', '-' );
		return By.css( `div[data-e2e-theme*='${ lowerCasedPhrase }']:not(.is-active)` );
	}

	static getStartURL() {
		return dataHelper.getCalypsoURL( 'themes' );
	}

	async showOnlyFreeThemes() {
		await this.showOnlyThemesType( 'free' );
	}

	async showOnlyPremiumThemes() {
		await this.showOnlyThemesType( 'premium' );
	}

	async showOnlyThemesType( type ) {
		await this.openShowcase();
		await driverHelper.clickWhenClickable( this.driver, By.css( `a[data-e2e-value="${ type }"]` ) );
		await this.waitUntilThemesLoaded();
	}

	async selectNewThemeStartingWith( phrase ) {
		const locator = ThemesPage._getThemeSelectionXpath( phrase );
		await driverHelper.clickWhenClickable( this.driver, locator );
	}

	async waitUntilThemesLoaded() {
		await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.themes-list .is-placeholder' )
		);
	}

	async waitForThemeStartingWith( phrase ) {
		const locator = ThemesPage._getThemeSelectionXpath( phrase );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
	}

	async clickNewThemeMoreButton() {
		const locator = By.css( '.theme-showcase__all-themes .is-actionable:not(.is-active) button' );

		await driverHelper.scrollIntoView( this.driver, locator );
		await driverHelper.clickWhenClickable( this.driver, locator );
	}

	async getFirstThemeName() {
		const locator = By.css( '.theme-showcase__all-themes .is-actionable:not(.is-active) h2' );
		const element = await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
		return await element.getText();
	}

	async getActiveThemeName() {
		const locator = By.css( '.is-actionable.is-active h2' );
		const element = await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
		return await element.getText();
	}

	async searchFor( phrase ) {
		const searchToggleLocator = By.css( '.themes-magic-search-card div.search' );
		const searchFieldLocator = By.css( '.themes-magic-search-card input.search__input' );
		await driverHelper.clickWhenClickable( this.driver, searchToggleLocator, this.explicitWaitMS );
		const searchFieldElement = await driverHelper.setWhenSettable(
			this.driver,
			searchFieldLocator,
			phrase
		);
		await searchFieldElement.sendKeys( ' ' );
		await this.waitUntilThemesLoaded();
	}

	async clickPopoverItem( name ) {
		const actionItemLocator = driverHelper.createTextLocator(
			By.css( '.popover__menu-item' ),
			name
		);
		await driverHelper.clickWhenClickable( this.driver, actionItemLocator );
	}

	async popOverMenuDisplayed() {
		const popOverMenuLocator = By.css( '.popover__menu' );
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			popOverMenuLocator
		);
	}

	async clearSearch() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.themes-magic-search-card__icon-close' )
		);
	}

	async openShowcase() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `button[data-e2e-value="open-themes-button"]` )
		);
	}
}
