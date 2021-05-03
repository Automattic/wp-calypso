/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

/**
 * POM class for interacting with popover menus in the Gutenberg editor.
 */
export default class GutenbergPopoverMenuComponent extends AsyncBaseContainer {
	constructor( driver, additionalMenuSelectors ) {
		let menuSelector = '.components-popover div[role=menu]';
		if ( additionalMenuSelectors && additionalMenuSelectors.ariaLabel ) {
			menuSelector += `[aria-label='${ additionalMenuSelectors.ariaLabel }']`;
		}

		if ( additionalMenuSelectors && additionalMenuSelectors.class ) {
			menuSelector += `.${ additionalMenuSelectors.class }`;
		}

		super( driver, By.css( menuSelector ) );
		this.menuSelector = menuSelector;
	}

	/**
	 * Expect the targeted popover menu to appear within the standard timeout time. All popover menus
	 * have the same basic DOM structure. However, certain popover menus can have different aria-labels
	 * and additional classes. So if you want to ensure a specific popover is open, use additionalMenuSelectors
	 * to be more specific.
	 *
	 * @param {Object} driver Instance of the Selenium WebDriver
	 * @param {{ariaLabel: string, class: string}} additionalMenuSelectors Optional object to specify more
	 * specific selectors to ensure a specific popover menu is open.
	 * @returns An instance of this class
	 */
	static async Expect( driver, additionalMenuSelectors ) {
		const page = new this( driver, additionalMenuSelectors );
		await page._expectInit();
		return page;
	}

	/**
	 * Select option from popover menu by text
	 *
	 * @param {string} text text to match in popover menu option
	 */
	async selectOptionByText( text ) {
		await driverHelper.selectElementByText(
			this.driver,
			// using menuitem role over button because there are some nested buttons in style previews
			// using partial match (*) to account for 'menuitemradio' role
			By.css( `${ this.menuSelector } [role*=menuitem]` ),
			text
		);
	}

	/**
	 * Select option from popover menu by the class attached to the menu item element
	 *
	 * @param {string} cssClass Class to match in popover menu item. No need to include period prefix.
	 */
	async selectOptionByCssClass( cssClass ) {
		// worth being extra safe since it needs to go right into a selector
		if ( ! cssClass.startsWith( '.' ) ) {
			cssClass = `.${ cssClass }`;
		}

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `${ this.menuSelector } [role*=menuitem]${ cssClass }` )
		);
	}

	/**
	 * Wait until the popover menu is gone
	 */
	async waitUntilPopoverIsGone() {
		await driverHelper.waitTillNotPresent( this.driver, By.css( this.menuSelector ) );
	}
}
