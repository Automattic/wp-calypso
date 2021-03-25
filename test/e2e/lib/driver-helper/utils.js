/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

export function resolveToBool( pendingPromise ) {
	return pendingPromise.then(
		( v ) => !! v,
		() => false
	);
}

/**
 * Stringifies the locator object. Useful for error reporting or logging.
 *
 * @param {By} locator - The element's locator
 * @returns {string} - Printable version of the locator
 */
export function getLocatorString( locator ) {
	return typeof loc === 'function' ? 'by function()' : locator + '';
}
