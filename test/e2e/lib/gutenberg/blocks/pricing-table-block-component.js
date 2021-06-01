/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

const pricingBlock = By.css( '.wp-block-coblocks-pricing-table' );
const defaultPricingTable = By.css(
	'.wp-block-coblocks-pricing-table__inner.has-columns.has-2-columns.has-responsive-columns.has-medium-gutter'
);
const pricingTableItemTitle = By.css( '.wp-block-coblocks-pricing-table-item__title' );
const pricingTableItemCurrency = By.css( '.wp-block-coblocks-pricing-table-item__currency' );
const pricingTableItemAmount = By.css( '.wp-block-coblocks-pricing-table-item__amount' );
const pricingTableItemFeatures = By.css( '.wp-block-coblocks-pricing-table-item__features' );
const pricingTableItemButton = By.css( '.wp-block-button__link' );
const pricingTableParentSelector = By.css( '.block-editor-block-parent-selector__button' );
const pricingTableChangeTextAlignment = By.id( 'id-vde5ot-6' );
const pricingTableAlignLeft = By.xpath( `//div/button[text()='Align text left']` );

const pricingTableLeftAlignedBlock = By.css(
	'wp-block-coblocks-pricing-table has-text-align-left'
);
const pricingTableChangeTableCount = By.css( 'button[aria-label="Change pricing table count"]' );
const pricingTableCountPopOver = By.css( '.components-popover__content' );
let pricingTableCellSelect;
const pricingTableItemMenu = By.xpath( 'button[aria-label="Pricing Table Item"]' );
const pricingTableItemButtonLink = By.css( 'button[aria-label="Link"]' );
const pricingTableItemButtonLinkInput = By.css( '.block-editor-url-input__input' );
const pricingTableItemButtonLinkSubmitButton = By.css(
	'.components-button.block-editor-link-control__search-submit.has-icon'
);
const pricingTableItemButtonLinkInputSelected = By.css(
	'.block-editor-link-control__search-item.is-current'
);
const pricingTableToWordpressOrg = By.xpath( `//*[@id="wporg-header"]/div/h1/a` );

export default class PricingTableBlockComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wp-block-coblocks-pricing-table' ) );
	}

	static get getPricingBlock() {
		return pricingBlock;
	}

	async pricingBlockVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, pricingBlock );
	}

	static get getDefaultPricingTable() {
		return defaultPricingTable;
	}

	async defaultPricingTableVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, defaultPricingTable );
	}

	static get getPricingTableItemTitle() {
		return pricingTableItemTitle;
	}

	async pricingTableItemTitleVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableItemTitle
		);
	}

	async pricingTableItemTitleClick() {
		return await this.driver.findElement( pricingTableItemTitle ).click();
	}

	async pricingTableItemTitleSendKeys( itemTitleText ) {
		return await this.driver.findElement( pricingTableItemTitle ).sendKeys( itemTitleText );
	}

	async pricingTableItemTitleGetText() {
		return await this.driver.findElement( pricingTableItemTitle ).getText();
	}

	static get getPricingTableItemCurrency() {
		return pricingTableItemCurrency;
	}

	async pricingTableItemCurrencyVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableItemCurrency
		);
	}

	async pricingTableItemCurrencySendKeys( currencyText ) {
		return await this.driver.findElement( pricingTableItemCurrency ).sendKeys( currencyText );
	}

	async pricingTableItemCurrencyGetText() {
		return await this.driver.findElement( pricingTableItemCurrency ).getText();
	}

	static get getPricingTableItemAmount() {
		return pricingTableItemAmount;
	}

	async pricingTableItemAmountVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableItemAmount
		);
	}

	async pricingTableItemAmountSendKeys( amountText ) {
		return await this.driver.findElement( pricingTableItemAmount ).sendKeys( amountText );
	}

	async pricingTableItemAmountGetText() {
		return await this.driver.findElement( pricingTableItemAmount ).getText();
	}

	static get getPricingTableItemFeatures() {
		return pricingTableItemFeatures;
	}

	async pricingTableItemFeaturesVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableItemFeatures
		);
	}

	async pricingTableItemFeaturesSendKeys( itemFeatureText ) {
		return await this.driver.findElement( pricingTableItemFeatures ).sendKeys( itemFeatureText );
	}

	async pricingTableItemFeaturesGetText() {
		return await this.driver.findElement( pricingTableItemFeatures ).getText();
	}

	static get getPricingTableItemButton() {
		return pricingTableItemButton;
	}

	async pricingTableItemButtonVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableItemButton
		);
	}

	async pricingTableItemButtonSendKeys( buttonText ) {
		return await this.driver.findElement( pricingTableItemButton ).sendKeys( buttonText );
	}

	async pricingTableItemButtonClick() {
		return await this.driver.findElement( pricingTableItemButton ).click();
	}

	async pricingTableItemButtonGetText() {
		return await this.driver.findElement( pricingTableItemButton ).getText();
	}

	static get getPricingTableParentSelectorElement() {
		return pricingTableParentSelector;
	}

	async pricingTableParentSelectorVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableParentSelector
		);
	}

	async pricingTableParentSelectorClick() {
		return await this.driver.findElement( pricingTableParentSelector ).click();
	}

	static get getPricingTableChangeTextAlignmentElement() {
		return pricingTableChangeTextAlignment;
	}

	async pricingTableChangeTextAlignmentVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableChangeTextAlignment
		);
	}

	async pricingTableChangeTextAlignmentClick() {
		return await this.driver.findElement( pricingTableChangeTextAlignment ).click();
	}

	static get getPricingTableAlignLeftElement() {
		return pricingTableAlignLeft;
	}

	async pricingTableAlignLeftVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableAlignLeft
		);
	}

	async pricingTableAlignLeftClick() {
		return await this.driver.findElement( pricingTableAlignLeft ).click();
	}

	static get getpricingTableLeftAlignedBlockElement() {
		return pricingTableLeftAlignedBlock;
	}

	async pricingTableLeftAlignedBlockVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableLeftAlignedBlock
		);
	}
	static get getPricingTableChangeTableCountElement() {
		return pricingTableChangeTableCount;
	}

	async pricingTableChangeTableCountVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableChangeTableCount
		);
	}

	async pricingTableChangeTableCountClick() {
		return await this.driver.findElement( pricingTableChangeTableCount ).click();
	}

	static get getPricingTableCountPopOverElement() {
		return pricingTableCountPopOver;
	}

	async pricingTableCountPopOverVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableCountPopOver
		);
	}

	async pricingTableCellSelectVisible( count ) {
		pricingTableCellSelect = By.xpath( `//button[text()='${ count }']` );
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableCellSelect
		);
	}

	async pricingTableCellSelectClick( count ) {
		pricingTableCellSelect = By.xpath( `//button[text()='${ count }']` );
		return await this.driver.findElement( pricingTableCellSelect ).click();
	}

	static get getPricingTableItemMenuElement() {
		return pricingTableItemMenu;
	}

	async pricingTableItemMenuVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableItemMenu
		);
	}

	static get getPricingTableItemButtonLinkElement() {
		return pricingTableItemButtonLink;
	}

	async pricingTableItemButtonLinkVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableItemButtonLink
		);
	}

	async pricingTableItemButtonLinkClick() {
		return await this.driver.findElement( pricingTableItemButtonLink ).click();
	}

	static get getPricingTableItemButtonLinkInputElement() {
		return pricingTableItemButtonLinkInput;
	}

	async pricingTableItemButtonLinkInputVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableItemButtonLinkInput
		);
	}

	async pricingTableItemButtonLinkInputClick() {
		return await this.driver.findElement( pricingTableItemButtonLinkInput ).click();
	}

	async pricingTableItemButtonLinkInputSendKeys( linkText ) {
		return await this.driver.findElement( pricingTableItemButtonLinkInput ).sendKeys( linkText );
	}

	static get getPricingTableItemButtonLinkSubmitButtonElement() {
		return pricingTableItemButtonLinkSubmitButton;
	}

	async pricingTableItemButtonLinkSubmitButtonVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableItemButtonLinkSubmitButton
		);
	}

	async pricingTableItemButtonLinkSubmitButtonClick() {
		return await this.driver.findElement( pricingTableItemButtonLinkSubmitButton ).click();
	}

	static get getPricingTableItemButtonLinkInputSelectedElement() {
		return pricingTableItemButtonLinkInputSelected;
	}

	async pricingTableItemButtonLinkInputSelectedVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableItemButtonLinkInputSelected
		);
	}

	static get getPricingTableToWordpressOrgElement() {
		return pricingTableToWordpressOrg;
	}

	async pricingTableToWordpressOrgVisible() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			pricingTableToWordpressOrg
		);
	}
}
