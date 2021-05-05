/**
 * External dependencies
 */
import { By, WebDriver } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';

import AsyncBaseContainer from '../async-base-container';
import GutenbergPopoverMenuComponent from './gutenberg-popover-menu-component';

/**
 * POM class for the block editing toolbar re-used throughout the Gutenberg editor
 */
export default class GutenbergBlockToolbarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		// Must account for the mobile toolbar too!
		let toolbarSelector;
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			toolbarSelector = '.edit-post-header-toolbar__block-toolbar';
		} else {
			toolbarSelector = '.block-editor-block-contextual-toolbar';
		}

		super( driver, By.css( toolbarSelector ) );
		this.toolbarSelector = toolbarSelector;
	}

	/**
	 * Expect the block toolbar to be found in the DOM within the standard timeout window, returning
	 * an instance of this class to interact with the toolbar.
	 * NOTE: the caller must take the necessary steps to ensure the toolbar will appear before calling Expect.
	 * The requirements to make the toolbar appear are too different among blocks to standardize here.
	 *
	 * @param {WebDriver} driver Instance of Selenium WebDriver
	 * @returns An instance of this class
	 */
	static async Expect( driver ) {
		const page = new this( driver );
		await page._expectInit();
		return page;
	}

	/**
	 * Click a button in the toolbar by the text of the button. E.g. "Add Media"
	 *
	 * @param {string} buttonText Button text to match
	 */
	async clickToolbarButtonByText( buttonText ) {
		await driverHelper.selectElementByText(
			this.driver,
			By.css( `${ this.toolbarSelector } button.components-button` ),
			buttonText
		);
	}

	/**
	 * Select an option from a popover menu opened from the toolbar by the CSS class of the popover menu item.
	 * This pass-through method is added here for convenience so popover menu workflows can be completed all from
	 * the toolbar component class.
	 *
	 * @param {string} cssClass Target CSS class of the popover menu item
	 */
	async selectDropdownOptionByCssClass( cssClass ) {
		const popoverMenuComponent = await GutenbergPopoverMenuComponent.Expect( this.driver );
		await popoverMenuComponent.selectOptionByCssClass( cssClass );
	}

	/**
	 * Select an option from a popover menu opened from the toolbar by the text of the popover menu item.
	 * This pass-through method is added here for convenience so popover menu workflows can be completed all from
	 * the toolbar component class.
	 *
	 * @param {string} text Target text of the popover menu item
	 */
	async selectDropdownOptionByText( text ) {
		const popoverMenuComponent = await GutenbergPopoverMenuComponent.Expect( this.driver );
		await popoverMenuComponent.selectOptionByText( text );
	}

	/**
	 * Click the toolbar button shared among blocks for transforming the block to a new type
	 */
	async openBlockTransformMenu() {
		const openMenuButtonLocator = By.css(
			` ${ this.toolbarSelector } .block-editor-block-switcher button`
		);
		await driverHelper.clickWhenClickable( this.driver, openMenuButtonLocator );
		// make sure it opens!
		await GutenbergPopoverMenuComponent.Expect( this.driver );
	}

	/**
	 * Transform the current block for this toolbar to a new block type using the toolbar transform button.
	 * The new block type is targeted from the class suffix of that option in the popover menu, which is usually
	 * just the name of the new block type.
	 *
	 * @param {string} targetBlockButtonClassSuffix suffix of the target block type class in the popover menu (e.g. 'columns')
	 */
	async transformBlockToNewType( targetBlockButtonClassSuffix ) {
		const targetButtonCssClass = `editor-block-list-item-${ targetBlockButtonClassSuffix }`;
		await this.openBlockTransformMenu();
		await this.selectDropdownOptionByCssClass( targetButtonCssClass );
	}

	// Future possible expansions:
	// - add aria-label based toolbar button clicking
	// - add methods for shared menu buttons, like the more options button
	// - add even more handling for popover/dropdown menu based buttons
}
