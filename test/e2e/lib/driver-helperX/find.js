/**
 * External dependencies
 */
import webdriver, { By, WebDriver, WebElement } from 'selenium-webdriver';

const { NoSuchElementError } = webdriver.error;

/**
 * Object containing an actual WebDriver locator and a text or a regular
 * expression to query the element by.
 *
 * @typedef {Object} TextLocator
 * @property {By} locator The element's locator
 * @property {string|RegExp} text The text or a regular expression to query the element by
 */

/**
 * Checks if an object contains a proper locator and a text to find an element by.
 *
 * @param {By} locator The element's locator
 * @returns {boolean} Whether it's a text locator or not
 */
export function isTextLocator( locator ) {
	return typeof locator === 'object' && locator !== null && locator.text && locator.locator;
}

/**
 * Stringifies the locator object. Useful for error reporting or logging.
 *
 * @param {By|TextLocator} locator The element's locator
 * @returns {string} Printable version of the locator
 */
export function getLocatorString( locator ) {
	let loc = locator;
	let txt;

	if ( isTextLocator( locator ) ) {
		loc = locator.locator;
		txt = locator.text;
	}
	const locatorStr = typeof loc === 'function' ? 'by function()' : loc + '';

	if ( ! txt ) {
		return locatorStr;
	}
	return `${ locatorStr } and text "${ txt }"`;
}

/**
 * Checks if given element's inner text matches the given string or regular
 * expression.
 *
 * @param {WebElement} element The element to check
 * @param {string|RegExp} match The matching string or regular expression
 * @returns {boolean} Whether the match was found or not
 * @throws {TypeError} If match arg is not a string or a regular expression
 */
export async function isMatchingElementInnerText( element, match ) {
	const elementText = await element.getText();
	if ( typeof match === 'string' ) {
		return elementText === match;
	}
	if ( match.test ) {
		return match.test( elementText );
	}
	throw new TypeError( 'Invalid argument; must be a string or a regular expression' );
}

/**
 * Finds an element via given locator.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|TextLocator} locator The element's locator
 * @returns {Promise<WebElement>} A promise that will resolve with the located element
 */
export async function findElement( driver, locator ) {
	if ( ! isTextLocator( locator ) ) {
		return driver.findElement( locator );
	}
	const elements = await findElements( driver, locator );

	if ( ! elements[ 0 ] ) {
		const locatorStr = getLocatorString( locator );
		throw new NoSuchElementError( `Unable to locate element ${ locatorStr }` );
	}
	return elements[ 0 ];
}

/**
 * Finds elements via given locator.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|TextLocator} locator The element's locator
 * @returns {Promise<WebElement>} A promise that will resolve with the located elements
 */
export async function findElements( driver, locator ) {
	if ( ! isTextLocator( locator ) ) {
		return driver.findElements( locator );
	}
	const allElements = await driver.findElements( locator.locator );

	if ( Array.isArray( allElements ) && allElements.length > 0 ) {
		return webdriver.promise.filter( allElements, ( element ) =>
			isMatchingElementInnerText( element, locator.text )
		);
	}
	return [];
}

export async function findElementIfVisible( driver, locator ) {
	const element = await findElement( driver, locator );
	const isDisplayed = await element.isDisplayed();

	return isDisplayed ? element : null;
}

export async function findElementIfClickable( driver, locator ) {
	const element = await findElement( driver, locator );
	const isEnabled = await element.isEnabled();
	const isAriaEnabled = await element.getAttribute( 'aria-disabled' ).then( ( v ) => v !== 'true' );

	return isEnabled && isAriaEnabled ? element : null;
}

export async function findElementIfFocused( driver, locator ) {
	const element = await findElement( driver, locator );
	const elementId = await element.getId();
	const activeElementId = await driver.switchTo().activeElement().getId();
	const isFocused = activeElementId === elementId;

	return isFocused ? element : null;
}

export async function findLinkIfFollowable(driver, locator) {
	const element = await
}
