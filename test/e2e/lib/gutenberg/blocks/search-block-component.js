/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

const searchBlockInsideWrapper = By.css( '.wp-block-search__inside-wrapper' );
const searchBlock = By.css( '.wp-block-search' );
const searchLabel = By.css( '.wp-block-search__label' );
const searchInput = By.css( '.wp-block-search__input' );
const searchButton = By.css( '.wp-block-search__button' );
const searchLabelToggleButton = By.css( 'button[aria-label="Toggle search label"]' );
const searchToggleIconButton = By.css( 'button[aria-label="Use button with icon"]' );
const searchButtonHasIcon = By.css( '.wp-block-search__button.has-icon' );
const changeButtonPosition = By.css( 'button[aria-label="Change button position"]' );
const changeButtonPositionMenu = By.css( '.wp-block-search__button-position-menu' );
const searchButtongPositionMenuNoButton = By.xpath( `//span[text()='No Button']` );
const searchResultspageTitle = By.css( '.page-title' );

export default class SearchBlockComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wp-block-search' ) );
	}

	static get getSearchBlockInsideWrapper() {
		return searchBlockInsideWrapper;
	}

	static get getSearchBlockElement() {
		return searchBlock;
	}

	static get getsearchLabelElement() {
		return searchLabel;
	}

	static get getsearchInputElement() {
		return searchInput;
	}

	static get getsearchButtonElement() {
		return searchButton;
	}

	static get getsearchResultsPageTitle() {
		return searchResultspageTitle;
	}

	async searchInputSendKeys( optionalText ) {
		return await this.driver.findElement( searchInput ).sendKeys( optionalText );
	}

	async searchInputClick() {
		return await this.driver.findElement( searchInput ).click();
	}
	async searchButtonClick() {
		return await this.driver.findElement( searchButton ).click();
	}

	async searchLabelToggleButtonClick() {
		return await this.driver.findElement( searchLabelToggleButton ).click();
	}

	async searchToggleButtonIconClick() {
		return await this.driver.findElement( searchToggleIconButton ).click();
	}

	async changeSearchButtonPositionClick() {
		return await this.driver.findElement( changeButtonPosition ).click();
	}

	async changeSearchButtonPositionMenuNoButtonClick() {
		return await this.driver.findElement( searchButtongPositionMenuNoButton ).click();
	}

	async searchBlockInsideWrapperVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			searchBlockInsideWrapper
		);
	}

	async searchBlockVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, searchBlock );
	}

	async searchLabelVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, searchLabel );
	}

	async searchInputVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, searchInput );
	}

	async searchLabelToggleButtonVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			searchLabelToggleButton
		);
	}

	async searchToggleButtonIconVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			searchToggleIconButton
		);
	}

	async searchHasIconButtonVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, searchButtonHasIcon );
	}

	async changeSearchButtonPosition() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			changeButtonPosition
		);
	}

	async changeSearchButtonPositionMenuVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			changeButtonPositionMenu
		);
	}

	async searchButtonVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, searchButton );
	}

	async searchResultsPageTitleVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			searchResultspageTitle
		);
	}
}
