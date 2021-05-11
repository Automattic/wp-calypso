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

	getStartURL() {
		return dataHelper.getCalypsoURL( 'themes' );
	}

	showOnlyFreeThemes() {
		return this.showOnlyThemesType( 'free' );
	}

	showOnlyPremiumThemes() {
		return this.showOnlyThemesType( 'premium' );
	}

	async showOnlyThemesType( type ) {
		await this.openShowcase();
		await driverHelper.clickWhenClickable( this.driver, By.css( `a[data-e2e-value="${ type }"]` ) );
		return this.waitUntilThemesLoaded();
	}

	selectNewTheme() {
		// select first theme from the list
		return driverHelper.clickWhenClickable( this.driver, By.css( '.theme__content' ) );
	}

	selectNewThemeStartingWith( phrase ) {
		const locator = ThemesPage._getThemeSelectionXpath( phrase );
		return driverHelper.clickWhenClickable( this.driver, locator );
	}

	waitUntilThemesLoaded() {
		return driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.themes-list .is-placeholder' )
		);
	}

	waitForThemeStartingWith( phrase ) {
		const locator = ThemesPage._getThemeSelectionXpath( phrase );
		return driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
	}

	async clickNewThemeMoreButton() {
		const locator = By.css( '.theme-showcase__all-themes .is-actionable:not(.is-active) button' );

		await driverHelper.scrollIntoView( this.driver, locator );
		return driverHelper.clickWhenClickable( this.driver, locator );
	}

	async getFirstThemeName() {
		const locator = By.css( '.theme-showcase__all-themes .is-actionable:not(.is-active) h2' );
		const element = await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
		return element.getText();
	}

	async getActiveThemeName() {
		const locator = By.css( '.is-actionable.is-active h2' );
		const element = await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
		return element.getText();
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
		return this.waitUntilThemesLoaded();
	}

	async clickPopoverItem( name ) {
		const actionItemLocator = driverHelper.createTextLocator(
			By.css( '.popover__menu-item' ),
			name
		);
		return driverHelper.clickWhenClickable( this.driver, actionItemLocator );
	}

	popOverMenuDisplayed() {
		const popOverMenuLocator = By.css( '.popover__menu' );
		return driverHelper.isElementEventuallyLocatedAndVisible( this.driver, popOverMenuLocator );
	}

	static _getThemeSelectionXpath( phrase ) {
		const lowerCasedPhrase = phrase.toLowerCase().replace( ' ', '-' );
		return By.css( `div[data-e2e-theme*='${ lowerCasedPhrase }']:not(.is-active)` );
	}

	clearSearch() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.themes-magic-search-card__icon-close' )
		);
	}

	openShowcase() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( `button[data-e2e-value="open-themes-button"]` )
		);
	}
}
