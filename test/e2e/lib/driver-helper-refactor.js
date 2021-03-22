/**
 * External dependencies
 */
import webdriver, { until, By, WebElementCondition } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from './driver-manager';
import { resolveToBool } from './utils';

const explicitWaitMS = config.get( 'explicitWaitMS' );

/**
 * Stringifies the locator object. Useful for error reporting or logging.
 *
 * @param {By} locator - The element's locator
 * @returns {string} - Printable version of the locator
 */
export function getLocatorString( locator ) {
	return typeof loc === 'function' ? 'by function()' : locator + '';
}

export async function closeCurrentWindow( driver ) {
	return await driver.close();
}

export async function switchToWindowByIndex( driver, index ) {
	const currentScreenSize = driverManager.currentScreenSize();
	const handles = await driver.getAllWindowHandles();
	await driver.switchTo().window( handles[ index ] );
	// Resize target window to ensure we stay in the same viewport size:
	await driverManager.resizeBrowser( driver, currentScreenSize );
}

export async function closeAllWindows( driver ) {
	const handles = await driver.getAllWindowHandles();

	if ( handles.length === 1 ) {
		await closeCurrentWindow( driver );
	} else if ( handles.length > 1 ) {
		for ( let i = handles.length - 1; i >= 0; i-- ) {
			await switchToWindowByIndex( driver, i );
			await closeCurrentWindow( driver );
		}
	}
	return handles;
}

async function elementLocated( driver, locator ) {
	const element = ( await driver.findElements( driver, locator ) )[ 0 ];

	return element;
}

async function elementNotLocated( driver, locator ) {
	const element = ( await driver.findElements( locator ) )[ 0 ];

	return ! element ? true : element;
}

async function elementLocatedAndVisible( driver, locator ) {
	const element = ( await driver.findElements( locator ) )[ 0 ];
	if ( ! element ) {
		return null;
	}
	const isDisplayed = await element.isDisplayed();

	return isDisplayed ? element : null;
}

async function elementClickable( driver, locator ) {
	const element = ( await driver.findElements( locator ) )[ 0 ];
	if ( ! element ) {
		return null;
	}
	const isEnabled = await element.isEnabled();
	const isAriaEnabled = await element.getAttribute( 'aria-disabled' ).then( ( v ) => v !== 'true' );

	return isEnabled && isAriaEnabled ? element : null;
}

async function elementFocused( driver, locator ) {
	const element = ( await driver.findElements( locator ) )[ 0 ];
	if ( ! element ) {
		return null;
	}
	const elementId = await element.getId();
	const activeElementId = await driver.switchTo().activeElement().getId();
	const isFocused = activeElementId === elementId;

	return isFocused ? element : null;
}

export async function imageVisible( driver, locator ) {
	const image = ( await driver.findElements( locator ) )[ 0 ];
	if ( ! image ) {
		return null;
	}
	const isVisible = await driver.executeScript(
		"return typeof arguments[ 0 ].naturalWidth !== 'undefined' && arguments[ 0 ].naturalWidth > 0;",
		image
	);

	return isVisible ? image : null;
}

// wait until

export function waitUntilElementLocated( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementLocated( locator ), timeout );
}

export function waitUntilElementsLocated( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementsLocated( locator ), timeout );
}

export function waitUntilElementNotLocated( driver, locator, timeout = explicitWaitMS ) {
	const locatorStr = getLocatorString( locator );
	return driver.wait(
		new WebElementCondition( `for element to NOT be located ${ locatorStr }`, () =>
			elementNotLocated( driver, locator )
		),
		timeout
	);
}

export function waitUntilElementLocatedAndVisible( driver, locator, timeout = explicitWaitMS ) {
	const locatorStr = getLocatorString( locator );
	return driver.wait(
		new WebElementCondition( `for element to be located and visible ${ locatorStr }`, () =>
			elementLocatedAndVisible( driver, locator )
		),
		timeout
	);
}

export function waitUntilElementClickable( driver, locator, timeout = explicitWaitMS ) {
	const locatorStr = getLocatorString( locator );
	return driver.wait(
		new WebElementCondition( `for element to be clickable ${ locatorStr }`, () =>
			elementClickable( driver, locator )
		),
		timeout
	);
}

export function waitUntilElementFocused( driver, locator, timeout = explicitWaitMS ) {
	const locatorStr = getLocatorString( locator );
	return driver.wait(
		new WebElementCondition( `for element to be focused ${ locatorStr }`, () =>
			elementFocused( driver, locator )
		),
		timeout
	);
}

export function waitUntilImageVisible( driver, locator, timeout = explicitWaitMS ) {
	const locatorStr = getLocatorString( locator );
	return driver.wait(
		new WebElementCondition( `for image to be visible ${ locatorStr }`, () =>
			imageVisible( driver, locator )
		),
		timeout
	);
}

export function waitUntilNumberOfWindowsOpen( driver, number, timeout = explicitWaitMS ) {
	return driver.wait(
		new WebElementCondition( `for ${ number } of windows to be open`, async () => {
			try {
				const handles = await driver.getAllWindowHandles();
				return handles.length === number ? handles : null;
			} catch {
				return null;
			}
		} ),
		timeout
	);
}

export async function waitUntilAllWindowsClosed( driver, timeout = explicitWaitMS ) {
	return driver.wait(
		new WebElementCondition( 'for all windows to be closed', async () => {
			try {
				const handles = await closeAllWindows( driver );
				return handles;
			} catch {
				return null;
			}
		} ),
		timeout
	);
}

// is *

export function isElementLocated( driver, locator ) {
	return resolveToBool( elementLocated( driver, locator ) );
}

export function isElementNotLocated( driver, locator ) {
	return resolveToBool( elementNotLocated( driver, locator ) );
}

export function isElementLocatedAndVisible( driver, locator ) {
	return resolveToBool( elementLocatedAndVisible( driver, locator ) );
}

export function isElementClickable( driver, locator ) {
	return resolveToBool( elementClickable( driver, locator ) );
}

export function isElementFocused( driver, locator ) {
	return resolveToBool( elementFocused( driver, locator ) );
}

export function isImageVisible( driver, locator ) {
	return resolveToBool( imageVisible( driver, locator ) );
}

// is eventually *

export function isElementEventuallyLocated( driver, locator ) {
	return resolveToBool( waitUntilElementLocated( driver, locator ) );
}

export function isElementEventuallyNotLocated( driver, locator ) {
	return resolveToBool( waitUntilElementNotLocated( driver, locator ) );
}

export function isElementEventuallyLocatedAndVisible( driver, locator ) {
	return resolveToBool( waitUntilElementLocatedAndVisible( driver, locator ) );
}

export function isElementEventuallyClickable( driver, locator ) {
	return resolveToBool( waitUntilElementClickable( driver, locator ) );
}

export function isElementEventuallyFocused( driver, locator ) {
	return resolveToBool( waitUntilElementFocused( driver, locator ) );
}

export function isImageEventuallyVisible( driver, locator ) {
	return resolveToBool( waitUntilImageVisible( driver, locator ) );
}
