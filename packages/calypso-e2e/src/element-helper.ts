import { Locator, Page } from 'playwright';
import envVariables from './env-variables';

const navTabParent = 'div.section-nav';

const selectors = {
	// clickNavTab
	navTabItem: ( { name = '', selected = false }: { name?: string; selected?: boolean } = {} ) =>
		`${ navTabParent } a[aria-current="${ selected }"]:has(span:has-text("${ name }"))`,
	navTabMobileToggleButton: `${ navTabParent } button.section-nav__mobile-header`,
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
		page.waitForFunction(
			( element: SVGElement | HTMLElement ) => element.ariaDisabled !== 'true',
			elementHandle
		),
	] );
}

/**
 * Locates and clicks on a specified tab on the NavTab.
 *
 * NavTabs are used throughout calypso to contain sub-pages within the parent page.
 * For instance, on the Media gallery page a NavTab is used to filter the gallery to
 * show a specific category of gallery items.
 *
 * @param {Page} page Underlying page on which interactions take place.
 * @param {string} name Name of the tab to be clicked.
 * @throws {Error} If the tab name is not the active tab.
 */
export async function clickNavTab(
	page: Page,
	name: string,
	{ force }: { force?: boolean } = {}
): Promise< void > {
	// Short circuit operation if the active tab and target tabs are the same.
	// Strip numerals from the extracted tab name to account for the slightly
	// different implementation in PostsPage.
	const selectedTabLocator = page.locator( selectors.navTabItem( { selected: true } ) );
	const selectedTabName = await selectedTabLocator.innerText();
	if ( selectedTabName.replace( /[0-9]/g, '' ) === name ) {
		return;
	}

	// If force option is specified, force click using a `dispatchEvent`.
	if ( force ) {
		return await page.dispatchEvent( selectors.navTabItem( { name: name } ), 'click' );
	}

	// Mobile view - navtabs become a dropdown and thus it must be opened first.
	if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
		await page.waitForLoadState( 'networkidle' );

		// Open the Navtabs which now act as a pseudo-dropdown menu.
		const navTabsButtonLocator = page.locator( selectors.navTabMobileToggleButton );
		await navTabsButtonLocator.click();

		const navTabIsOpenLocator = page.locator( `${ navTabParent }.is-open` );
		await navTabIsOpenLocator.waitFor();
	}

	// Click on the intended item and wait for navigation to finish.
	const navTabItem = page.locator( selectors.navTabItem( { name: name, selected: false } ) );
	await Promise.all( [ page.waitForNavigation( { timeout: 10 * 1000 } ), navTabItem.click() ] );

	// Final verification.
	const newSelectedTabLocator = page.locator(
		selectors.navTabItem( { name: name, selected: true } )
	);
	const newSelectedTabName = await newSelectedTabLocator.innerText();

	// Strip numerals from the extracted tab name, similar to above.
	if ( newSelectedTabName.replace( /[0-9]/g, '' ) !== name ) {
		throw new Error(
			`Failed to confirm NavTab is active: expected ${ name }, got ${ newSelectedTabName }`
		);
	}
}

/**
 * Retry any function up to three times or action passes without throwing an exception,
 * whichever comes first.
 *
 * The function being passed in must throw an exception for this retry to work.
 *
 * This is useful for situations where the backend must process the results of a
 * previous action then inform the front end of the result of the process.
 * An example of this is the user invitation system where the backend must receive,
 * verify and send the invitation issued by a user. If the resulting checks were
 * successful, the resulting invitation is shown as 'pending'.
 *
 * @param {Page} page Page object.
 */
export async function reloadAndRetry(
	page: Page,
	func: ( page: Page ) => Promise< void >
): Promise< void > {
	for ( let retries = 3; retries > 0; retries -= 1 ) {
		try {
			return await func( page );
		} catch ( err ) {
			// Throw the error if final retry failed.
			if ( retries === 1 ) {
				throw err;
			} else {
				await page.reload();
			}
		}
	}
	return;
}

/**
 * Gets and validates the block ID from a Locator to a parent Block element in the editor.
 *
 * @param {Locator} block A frame-safe Loccator to the top of a block.
 * @returns A block ID that can be used to identify the block in the DOM later.
 */
export async function getIdFromBlock( block: Locator ): Promise< string > {
	const blockId = await block.getAttribute( 'id' );
	const blockIdRegex = /^block-[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/;
	if ( ! blockId || ! blockIdRegex.test( blockId ) ) {
		throw new Error( `Unable to find valid block ID from Locator. ID was "${ blockId }"` );
	}

	return blockId;
}

/**
 *
 * @param page
 */
export async function waitForWPWidgets( page: Page ) {
	await page.evaluate( async () => {
		await new Promise( ( resolve ) => {
			const wait = () => setTimeout( resolve, 1000 );
			let timeout = wait();

			window.addEventListener( 'message', ( event ) => {
				if ( event.origin === 'https://widgets.wp.com' ) {
					console.log( 'widgets loading' );
					clearTimeout( timeout );
					timeout = setTimeout( resolve, 1000 );
				}
			} );
		} );
	} );
}
