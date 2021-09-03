import { Page } from 'playwright';
import { getTargetDeviceName } from './browser-helper';

const selectors = {
	// clickNavTab
	navTab: ( tab: string ) => `.section-nav-tab:has-text("${ tab }")`,
	selectedNavTab: ( tab: string ) => `li.section-nav-tab.is-selected:has-text("${ tab }")`,
	mobileNavTabsToggle: 'button.section-nav__mobile-header',
};

/**
 * Waits for the element specified by the selector to become enabled.
 *
 * There are two definitions of disabled on wp-calypso:
 * 		- traditional: set the `disabled` property on element.
 * 		- aria: using the `aria-disabled` attribute.
 *
 * Playwright's `isEnabled` method does not look into `aria-disabled = "true"` when determining
 * actionability. This means test steps may fail if it depends on the built-in `isEnabled` to
 * assert actionability.
 *
 * This function will check for both the`disabled` property and `aria-disabled="false"` attributes
 * to determine whether the element is enabled.
 *
 * @param {Page} page Page object.
 * @param {string} selector Selector of the target element.
 * @param {{[key: string]: number}} options Object parameter.
 * @param {number} options.timeout Timeout to override the default value.
 */
export async function waitForElementEnabled(
	page: Page,
	selector: string,
	options?: { timeout?: number }
): Promise< void > {
	const elementHandle = await page.waitForSelector( selector, options );
	await Promise.all( [
		elementHandle.waitForElementState( 'enabled', options ),
		page.waitForFunction( ( element: any ) => element.ariaDisabled !== 'true', elementHandle ),
	] );
}

/**
 * Locates and clicks on a specified tab on the NavTab.
 *
 * NavTabs are used throughout calypso to contain multiple related but separate pages within the same
 * overall page. For instance, on the Media gallery page a NavTab is used to filter the gallery to
 * show a specific category of gallery items.
 *
 * @param {Page} page Underlying page on which interactions take place.
 * @param {string} name Name of the tab to be clicked.
 */
export async function clickNavTab( page: Page, name: string ): Promise< void > {
	const targetDevice = getTargetDeviceName();

	if ( targetDevice === 'mobile' ) {
		// Mobile view - navtabs become a dropdown.
		await page.click( selectors.mobileNavTabsToggle );
		await page.click( selectors.navTab( name ) );
	} else {
		// Desktop view - navtabs are constantly visible tabs.
		await page.click( selectors.navTab( name ) );
	}

	// Check that intended tab is now selected.
	// Instead of using `waitForSelector`, this appraoch of manually checking
	// the attribute in classList is preferable as it works across all scenarios.
	// See https://github.com/Automattic/wp-calypso/issues/56038.
	const elementHandle = await page.$( selectors.selectedNavTab( name ) );
	const isSelected = await elementHandle
		?.getAttribute( 'class' )
		.then( ( classes ) => classes?.includes( 'is-selected' ) );
	if ( ! isSelected ) {
		throw new Error( `Failed to select tab ${ name }.` );
	}
}
