import { Page } from 'playwright';
import { getTargetDeviceName } from './browser-helper';

const selectors = {
	// clickNavTab
	navTab: ( tab: string ) => `.section-nav-tab:has-text("${ tab }")`,
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

	// Mobile view - navtabs become a dropdown.
	if ( targetDevice === 'mobile' ) {
		await page.click( selectors.mobileNavTabsToggle );
	}

	// Get the current active tab, then check against the intended target.
	// If active tab and intended tab are same, short circuit the operation.
	// If target device is mobile, close the NavTab dropdown.
	const currentTab = await page
		.waitForSelector( 'a[aria-current="true"]' )
		.then( ( element ) => element.innerText() );

	if ( currentTab === name ) {
		if ( targetDevice === 'mobile' ) {
			await page.click( selectors.mobileNavTabsToggle );
		}
		return;
	}

	// Click on the intended NavTab and wait for navigation to finish.
	// This implicitly checks whether the intended tab is now active.
	const elementHandle = await page.waitForSelector( selectors.navTab( name ) );
	await Promise.all( [ page.waitForNavigation(), elementHandle.click() ] );
}

/**
 * Retry any action up to three times or action passes without throwing an exception,
 * whichever comes first.
 *
 * This is useful for situations where the backend must process the results of a
 * previous action then inform the front end of the result of the process.
 * An example of this is the user invitation system where the backend must receive,
 * verify and send the invitation issued by a user. If the resulting checks were
 * successful, the resulting invitation is shown as 'pending'.
 *
 * @param {Page} page Page object.
 */
export async function retryAction(
	page: Page,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	func: ( page: Page, ...args: any[] ) => Promise< void >
): Promise< void > {
	for ( let retries = 3; retries > 0; retries -= 1 ) {
		try {
			await func( page );
		} catch {
			await page.reload();
		}
	}
	return;
}
