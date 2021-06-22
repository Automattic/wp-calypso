/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */
import { ElementHandle, Page } from 'playwright';

/**
 * Returns a boolean value on whether the element is considered 'disabled'.
 *
 * There are two definitions of disabled on wp-calypso:
 * 		- traditional: set the `disabled` property on element.
 * 		- aria: using the `aria-disabled` attribute.
 *
 * Playwright's `isEnabled` method does not look into `aria-disabled = "true"` when determining
 * actionability. This means test steps may fail if it depends on the built-in `isEnabled` to
 * assert actionability.
 *
 * @param {ElementHandle} elementHandle Element on page.
 * @returns {Promise<boolean} True if ElementHandle is considered disabled, false otherwise.
 */
export async function isElementEnabled( elementHandle: ElementHandle ): Promise< boolean > {
	const isEnabled = await elementHandle.isEnabled();
	const isAriaEnabled = await elementHandle.getAttribute( 'aria-disabled' );

	// If there is no `aria-disabled` attribute, then only take into account whether the element
	// contains a `disabled` property set. For more information, see
	// https://playwright.dev/docs/actionability#enabled.
	if ( ! isAriaEnabled ) {
		return isEnabled;
	}

	// Otherwise, check both the property set and aria for whether the element is considered 'disabled'.
	return isEnabled && isAriaEnabled === 'true';
}

/**
 * Waits for the element specified by the selector to become enabled.
 *
 * This function takes into account both `disabled` property and `aria-disabled="false"` attributes
 * to determine whether the element is enabled.
 *
 * @param {Page} page Page object.
 * @param {string} selector Selector of the target element.
 * @param {{[key: string]: number}} options Object parameter.
 * @param {number} options.timeout Timeout to override the default value.
 *
 */
export async function waitForElementEnabled(
	page: Page,
	selector: string,
	options?: { timeout?: number }
): Promise< ElementHandle > {
	const timeout = ( options?.timeout
		? options?.timeout
		: config.get( 'playwrightTimeoutMS' ) ) as number;
	const elementHandle = await page.waitForSelector( selector );

	for ( let i = 0; i <= timeout; i + 1000 ) {
		const isEnabled = await isElementEnabled( elementHandle );
		if ( isEnabled ) {
			return elementHandle;
		}
	}

	throw new Error( `Failed to wait for requested selector ${ selector } to be enabled.` );
}
