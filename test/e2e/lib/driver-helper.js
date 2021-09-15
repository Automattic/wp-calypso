import { sprintf } from '@wordpress/i18n';
import config from 'config';
import request from 'request-promise';
import {
	By,
	Condition,
	Key,
	promise,
	until,
	WebDriver,
	WebElement,
	WebElementCondition,
} from 'selenium-webdriver';
import * as dataHelper from './data-helper';
import * as driverManager from './driver-manager';

const explicitWaitMS = config.get( 'explicitWaitMS' );

/**
 * Creates a locator function for finding elements with given inner text.
 *
 * @example
 * const profileButtonLocator = driverHelper.createTextLocator( By.css( '.menu-item' ), 'Profile' );
 * await driverHelper.clickWhenClickable( driver, profileButtonLocator );
 * @param {By|Function} locator The element's locator
 * @param {string|RegExp} text The element's inner text
 * @returns {Function} An element locator function
 */
export function createTextLocator( locator, text ) {
	async function textLocator( driver ) {
		const allElements = await driver.findElements( locator );
		return await promise.filter( allElements, async ( element ) => {
			const elementText = await element.getText();
			if ( typeof text === 'string' ) {
				return elementText === text;
			}
			if ( typeof text.test === 'function' ) {
				return text.test( elementText );
			}
			throw new Error( 'Unknown matcher type; must be a string or a regular expression' );
		} );
	}

	textLocator.toString = function () {
		return `${ getLocatorString( locator ) } and text "${ text }"`;
	};

	return textLocator;
}

/**
 * Waits until an element is located in DOM. Throws an error after it times out.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with the located element
 */
export async function waitUntilElementLocated( driver, locator, timeout ) {
	return await driver.wait( until.elementLocated( locator ), timeout );
}

/**
 * Waits until an element is NOT located in DOM. Throws an error after it times
 * out.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with true when the element becomes
 * unavailable
 */
export async function waitUntilElementNotLocated( driver, locator, timeout ) {
	const locatorStr = getLocatorString( locator );

	return await driver.wait(
		new Condition( `for element to NOT be located ${ locatorStr }`, function () {
			return isElementNotLocated( driver, locator );
		} ),
		timeout
	);
}

/**
 * Waits until an element is located in DOM and visible. Throws an error after it times out.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with the located element
 */
export async function waitUntilElementLocatedAndVisible(
	driver,
	locator,
	timeout = explicitWaitMS
) {
	const locatorStr = getLocatorString( locator );

	return await driver.wait(
		new WebElementCondition(
			`for the element to become located and visible ${ locatorStr }`,
			async function () {
				try {
					const element = await driver.findElement( locator );
					const isDisplayed = await element.isDisplayed();

					return isDisplayed ? element : null;
				} catch {
					return null;
				}
			}
		),
		timeout
	);
}

/**
 * Waits until an element stops moving. Useful for interacting with animated elements.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with the located element
 */
export async function waitUntilElementStopsMoving( driver, locator, timeout = explicitWaitMS ) {
	const locatorStr = getLocatorString( locator );
	let elementX;
	let elementY;

	return await driver.wait(
		new Condition( `for an element to stop moving ${ locatorStr }`, async function () {
			try {
				const element = await driver.findElement( locator );
				const elementRect = await driver.executeScript(
					`return arguments[0].getBoundingClientRect()`,
					element
				);

				if ( elementX !== elementRect.x || elementY !== elementRect.y ) {
					elementX = elementRect.x;
					elementY = elementRect.y;
					return null;
				}

				return element;
			} catch {
				return null;
			}
		} ),
		timeout
	);
}

/**
 * Waits until given element is clickable. A clickable element must be located and not
 * (aria-)disabled.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with the clickable element
 */
export async function waitUntilElementClickable( driver, locator, timeout = explicitWaitMS ) {
	const locatorStr = getLocatorString( locator );

	return await driver.wait(
		new WebElementCondition( `for element to be clickable ${ locatorStr }`, async function () {
			try {
				const element = await waitUntilElementStopsMoving( driver, locator );
				const isEnabled = await element.isEnabled();
				const isAriaEnabled = await element
					.getAttribute( 'aria-disabled' )
					.then( ( v ) => v !== 'true' );

				return isEnabled && isAriaEnabled ? element : null;
			} catch {
				return null;
			}
		} ),
		timeout
	);
}

/**
 * Waits until the input driver is able to switch to the designated frame. Upon successful
 * resolution, the driver will be left focused on the new frame.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The frame element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<boolean>} A promise that will resolve with true if the switch was succesfull
 */
export async function waitUntilAbleToSwitchToFrame( driver, locator, timeout = explicitWaitMS ) {
	return await driver.wait( until.ableToSwitchToFrame( locator ), timeout );
}

/**
 * Waits until a window of a given index is ready to be switched to and switches to it.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {number} windowIndex The index of the window to switch to
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<boolean>} A promise that will resolve with true if the switch was succesfull
 */
export async function waitUntilAbleToSwitchToWindow(
	driver,
	windowIndex,
	timeout = explicitWaitMS
) {
	return await driver.wait(
		new Condition( `to be able to switch to window #${ windowIndex }`, async function () {
			try {
				await switchToWindowByIndex( driver, windowIndex );
			} catch {
				return null;
			}

			return true;
		} ),
		timeout
	);
}

/**
 * Waits until a window alert becomes present.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise} A promise that will be resolved when alert is present
 */
export async function waitUntilAlertPresent( driver, timeout = explicitWaitMS ) {
	return await driver.wait( until.alertIsPresent(), timeout );
}

/**
 * Waits for an element to become clickable and clicks it.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with the clicked element
 */
export async function clickWhenClickable( driver, locator, timeout = explicitWaitMS ) {
	const element = await waitUntilElementClickable( driver, locator, timeout );

	try {
		await highlightElement( driver, element );
		await element.click();
	} catch ( error ) {
		// Flaky response back from IE, so assume success and hope for the best
		if ( global.browserName === 'Internet Explorer' ) {
			console.log( "WARNING: IE claims the click action failed, but we're proceeding anyway!" );
		} else {
			throw error;
		}
	}

	return element;
}

/**
 * Clicks an element with given locator if it's located in DOM.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @returns {Promise<WebElement>} A promise that will resolve with the located element
 */
export async function clickIfPresent( driver, locator ) {
	if ( await isElementLocated( driver, locator ) ) {
		return await clickWhenClickable( driver, locator );
	}
	return null;
}

/**
 * Types a key sequence on the DOM element.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @param {number|string} value The element's value to set
 * @param {Object} options The options object
 * @param {boolean} options.secureValue Whether the value should be displayed in case of an error
 * @param {number} options.pauseBetweenKeysMS The time between keystrokes
 * @returns {Promise<WebElement>} A promise that will resolve with the located element
 */
export async function setWhenSettable(
	driver,
	locator,
	value,
	{ secureValue = false, pauseBetweenKeysMS = 0 } = {}
) {
	const locatorStr = getLocatorString( locator );
	let timeout = explicitWaitMS;
	let errorMessage = `for element to be settable ${ locatorStr }`;

	if ( ! secureValue ) {
		errorMessage = `${ errorMessage } to "${ value }"`;
	}

	if ( typeof pauseBetweenKeysMS === 'number' && pauseBetweenKeysMS > 0 ) {
		// Make sure that typing time is accounted for
		timeout = timeout + value.length * pauseBetweenKeysMS;
	}

	return await driver.wait(
		new WebElementCondition( errorMessage, async function () {
			try {
				const element = await driver.findElement( locator );
				await highlightElement( driver, element );

				const currentValue = await getInputText( element );

				if ( currentValue === value ) {
					// Do nothing if given value is already set
					return element;
				}

				if ( currentValue ) {
					// Clear the input if it has some value
					await element.sendKeys( Key.END );
					for ( let i = 0; i < currentValue.length; i++ ) {
						await element.sendKeys( Key.BACK_SPACE );
					}
				}
				if ( ! pauseBetweenKeysMS ) {
					await element.sendKeys( value );
				} else {
					for ( let i = 0; i < value.length; i++ ) {
						await driver.sleep( pauseBetweenKeysMS );
						await element.sendKeys( value[ i ] );
					}
				}
				const newValue = await element.getAttribute( 'value' );

				return newValue === value ? element : null;
			} catch {
				return null;
			}
		} ),
		timeout
	);
}

/**
 * Checks or unchecks a checkbox element via click.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The checkbox element locator
 * @param {boolean} [check=true] Whether the checkbox should be checked or not
 * @returns {Promise<WebElement>} A promise that will resolve with the located checkbox
 */
export async function setCheckbox( driver, locator, check = true ) {
	const element = await waitUntilElementLocatedAndVisible( driver, locator );
	const elementType = await element.getAttribute( 'type' );
	const isCheckbox = 'checkbox' === elementType;
	if ( ! isCheckbox ) {
		throw new TypeError( `Element is not a checkbox: ${ elementType }` );
	}

	const isChecked = 'true' === ( await element.getAttribute( 'checked' ) );

	if ( ( check && isChecked ) || ( ! check && ! isChecked ) ) {
		return element;
	}
	return await clickWhenClickable( driver, () => element );
}

/**
 * Scrolls the page to an element with the given locator.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @param {string} [position='center'] An element's position. Can be 'start', 'end' and 'center'
 * @returns {Promise<WebElement>} A promise that will resolve with the located element
 */
export async function scrollIntoView( driver, locator, position = 'center' ) {
	const element = await waitUntilElementLocatedAndVisible( driver, locator );

	return await driver.executeScript(
		`arguments[0].scrollIntoView( { block: "${ position }", inline: "center" } )`,
		element
	);
}

/**
 * Accepts window alert if present.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 */
export async function acceptAlertIfPresent( driver ) {
	try {
		await driver.switchTo().alert().accept();
	} catch {}
}

/**
 * Dismisses window alert if present.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 */
export async function dismissAlertIfPresent( driver ) {
	try {
		await driver.switchTo().alert().dismiss();
	} catch {}
}

/**
 * Switches to a window with given index.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {number} index The index of the target window
 */
export async function switchToWindowByIndex( driver, index ) {
	const currentScreenSize = driverManager.currentScreenSize();
	const handles = await driver.getAllWindowHandles();

	await driver.switchTo().window( handles[ index ] );
	if ( currentScreenSize !== 'desktop' ) {
		// Resize target window to ensure we stay in the same viewport size:
		await driverManager.resizeBrowser( driver, currentScreenSize );
	}
}

/**
 * Closes a window that is currently active.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 */
export async function closeCurrentWindow( driver ) {
	await driver.close();
}

/**
 * Closes all open windows except the one that is currently active.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 */
export async function closeAllPopupWindows( driver ) {
	const numWindows = await numberOfOpenWindows( driver );
	let windowIndex;
	for ( windowIndex = 1; windowIndex < numWindows; windowIndex++ ) {
		await switchToWindowByIndex( driver, windowIndex );
		await closeCurrentWindow( driver );
	}
	await switchToWindowByIndex( driver, 0 );
}

/**
 * When called, it will keep refreshing the page as long as the JN error is thrown.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 */
export async function refreshIfJNError( driver ) {
	if ( dataHelper.getTargetType() !== 'JETPACK' ) {
		return false;
	}
	// Match only 503 Error codes
	const jnSiteError = By.xpath(
		"//pre[@class='error' and .='/srv/users/SYSUSER/log/APPNAME/APPNAME_apache.error.log' and //title[.='503 Service Unavailable']]"
	);
	// Match WP DB error
	const jnDBError = By.xpath( '//h1[.="Error establishing a database connection"]' );

	const refreshIfNeeded = async () => {
		const jnErrorDisplayed = await isElementEventuallyLocatedAndVisible(
			driver,
			jnSiteError,
			2000
		);
		const jnDBErrorDisplayed = await isElementLocated( driver, jnDBError );
		if ( jnErrorDisplayed || jnDBErrorDisplayed ) {
			console.log( 'JN Error! Refreshing the page' );
			await driver.navigate().refresh();
			await refreshIfNeeded();
		}
	};

	await refreshIfNeeded();
}

/**
 * Checks whether an element is located in DOM or not.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @returns {Promise<boolean>} A promise that will be resolved with whether the element is located
 * or not
 */
export async function isElementLocated( driver, locator ) {
	try {
		return !! ( await driver.findElement( locator ) );
	} catch {
		return false;
	}
}

/**
 * An opposite to the isElementLocated helper.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @returns {Promise<boolean>} A promise that will be resolved to true if the element is not located
 */
export async function isElementNotLocated( driver, locator ) {
	return ! ( await isElementLocated( driver, locator ) );
}

/**
 * Checks whether an element is eventually located in DOM and visible.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with whether the element is
 * located and visible
 */
export async function isElementEventuallyLocatedAndVisible(
	driver,
	locator,
	timeout = explicitWaitMS
) {
	try {
		await waitUntilElementLocatedAndVisible( driver, locator, timeout );
		return true;
	} catch {
		return false;
	}
}

/**
 * Check whether an image element is actually visible - that is rendered to the screen - not just
 * having a reference in the DOM.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By|Function} locator The image element locator
 * @returns {Promise<boolean>} A promise that will resolve with whether the image is visible or not
 */
export async function isImageVisible( driver, locator ) {
	const element = await driver.findElement( locator );
	const tagName = await element.getTagName();
	if ( tagName.toUpperCase() !== 'IMG' ) {
		throw new Error( `Element is not an image: ${ tagName }` );
	}

	return driver.executeScript( 'return arguments[ 0 ].naturalWidth > 0', element );
}

/**
 * Returns the number of all currently open windows.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @returns {number} The number of open windows
 */
export async function numberOfOpenWindows( driver ) {
	const handles = await driver.getAllWindowHandles();
	return handles.length;
}

/**
 * Returns the valye/text from an input or input-like element.
 *
 * Some inputs might not be real input elements, but elements
 * with `contentediable` set to `true`.
 *
 * @param {WebElement} element The element to be highlighted
 * @returns {string} the value for the input or the textContent property
 * for `contenteditable` elements.
 */
export async function getInputText( element ) {
	const value = await element.getAttribute( 'value' );
	if ( typeof value === 'string' ) {
		return value;
	}

	const isContentEditable = ( await element.getAttribute( 'contenteditable' ) ) === 'true';
	if ( isContentEditable ) {
		return await element.getText();
	}

	throw new Error(
		'Element is not an input element nor an element with `contenteditable` set to `true`.'
	);
}

/**
 * Highlights given element via inline style to indicate user action. Used for debugging purposes.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {WebElement} element The element to be highlighted
 */
async function highlightElement( driver, element ) {
	if ( process.env.HIGHLIGHT_ELEMENT === 'true' ) {
		await driver.executeScript(
			"arguments[0].setAttribute('style', 'background: gold; border: 2px solid red;');",
			element
		);
	}
}

/**
 * Returns a human-readable version of the given locator. Used for providing better error stack.
 *
 * @param {By|Function} locator The element's locator
 * @returns {string} The stringified locator
 */
function getLocatorString( locator ) {
	if ( typeof locator === 'function' && locator.name !== 'textLocator' ) {
		return locator.name ? `by function ${ locator.name }()` : 'by function()';
	}
	return locator.toString();
}

async function fetchTranslations( originals, locale, project = 'wpcom' ) {
	return request
		.post( 'https://translate.wordpress.com/api/translations/-query-by-originals', {
			form: {
				project,
				locale_slug: locale,
				original_strings: JSON.stringify( originals ),
			},
		} )
		.then( ( response ) => {
			let translations = JSON.parse( response );
			delete translations.originals_not_found;
			translations = Object.values( translations );

			return translations;
		} )
		.catch( () => null );
}

async function getElementsTranslations( elements, locale, project ) {
	// Default locale doesn't have translations
	if ( locale === 'en' ) {
		return null;
	}

	const originals = await promise.map( elements, async ( element ) => {
		const singular = await element.getAttribute( 'data-e2e-string' );
		return { singular };
	} );

	return fetchTranslations( originals, locale, project );
}

export async function verifyTranslationsPresent(
	driver,
	locale,
	selector = '[data-e2e-string]',
	waitOverride
) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;
	const translatableElements = await promise.filter(
		await driver.findElements( By.css( selector ) ),
		Boolean
	);
	const translations = await getElementsTranslations( translatableElements, locale );

	for ( const element of translatableElements ) {
		const singular = await element.getAttribute( 'data-e2e-string' );
		// In order to test translations with placeholders, parameters must be passed as JSON encoded string.
		// For example, `<div data-e2e-string="'Hello, %s!'" data-e2e-string-params={[ 'Jane' ]}}>{ sprintf( __( 'Hello, %s!' ), 'Jane' ) }</div>`.
		const params = await element.getAttribute( 'data-e2e-string-params' );

		let translation = singular;

		// Translation for default locale should match the original.
		if ( locale !== 'en' ) {
			const translationEntry =
				translations && translations.find( ( entry ) => entry.original.singular === singular );
			translation =
				translationEntry &&
				translationEntry.translations &&
				translationEntry.translations[ 0 ] &&
				translationEntry.translations[ 0 ].translation_0;
		}

		if ( params ) {
			translation = sprintf( translation, ...JSON.parse( params ) );
		}

		await driver.wait(
			function () {
				return ( async () => {
					// Non-breaking space characters are being replaced with regular space characters,
					// due to an inconsistency in `element.getText()` causing it to return the text with
					// the non-breaking space characters converted in some cases.
					const elementTextSanitized = ( await element.getText() )
						.trim()
						.replace( /[\u00A0]/g, ' ' );
					const translationSanitized = translation.trim().replace( /[\u00A0]/g, ' ' );

					return elementTextSanitized === translationSanitized;
				} )();
			},
			timeoutWait,
			`Timed out waiting for element with translatable string '${ singular }' to be displayed with translation '${ translation }'`
		);
	}
}
