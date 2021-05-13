/**
 * External dependencies
 */
import webdriver, {
	By,
	Condition,
	Key,
	logging,
	WebDriver,
	WebElement,
	WebElementCondition,
	error as webdriverError,
} from 'selenium-webdriver';
import config from 'config';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import * as SlackNotifier from './slack-notifier.js';
import * as dataHelper from './data-helper';
import * as driverManager from './driver-manager';

const explicitWaitMS = config.get( 'explicitWaitMS' );
const by = webdriver.By;

export async function highlightElement( driver, element ) {
	if ( process.env.HIGHLIGHT_ELEMENT === 'true' ) {
		return await driver.executeScript(
			"arguments[0].setAttribute('style', 'background: gold; border: 2px solid red;');",
			element
		);
	}
}

const until = {
	...webdriver.until,
	/**
	 * Creates a condition that will loop until element is clickable. A clickable
	 * element must be located and not (aria-)disabled.
	 *
	 * @param {By} locator The element's locator
	 * @returns {WebElementCondition} The new condition
	 */
	elementIsClickable( locator ) {
		const locatorStr = typeof locator === 'function' ? 'by function()' : locator + '';

		return new WebElementCondition(
			`for element to be clickable ${ locatorStr }`,
			async function ( driver ) {
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
			}
		);
	},
};

/**
 * Clicks an element when it becomes clickable. Throws an error after it
 * times out.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with
 * the clicked element
 */
export async function clickWhenClickable( driver, locator, timeout = explicitWaitMS ) {
	const element = await driver.wait( until.elementIsClickable( locator ), timeout );

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
 * Checks whether an element is located in DOM or not.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @returns {Promise<boolean>} A promise that will be resolved with whether the
 * element is located or not
 */
export async function isElementLocated( driver, locator ) {
	const elements = await driver.findElements( locator );
	return elements.length > 0;
}

/**
 * An opposite to the isElementLocated helper.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @returns {Promise<boolean>} A promise that will be resolved with true if the
 * element is not in DOM
 */
export async function isElementNotLocated( driver, locator ) {
	return ! ( await isElementLocated( driver, locator ) );
}

/**
 * Waits until an element is located in DOM and visible. Throws an error after
 * it times out.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with
 * the located element
 */
export function waitUntilElementLocatedAndVisible( driver, locator, timeout = explicitWaitMS ) {
	const locatorStr = typeof locator === 'function' ? 'by function()' : locator + '';

	return driver.wait(
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
 * Waits until an element is located in DOM. Throws an error after it times out.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with
 * the located element
 */
export function waitUntilElementLocated( driver, locator, timeout ) {
	return driver.wait( until.elementLocated( locator ), timeout );
}

/**
 * Waits until an element is NOT located in DOM. Throws an error after it times
 * out.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with true when
 * the element becomes unavaialble
 */
export function waitUntilElementNotLocated( driver, locator, timeout ) {
	const locatorStr = typeof locator === 'function' ? 'by function()' : locator + '';

	return driver.wait(
		new Condition( `for element to NOT be located ${ locatorStr }`, function () {
			return isElementNotLocated( driver, locator );
		} ),
		timeout
	);
}

/**
 * Checks whether an element is eventually located in DOM and visible.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with whether
 * the element is located and visible
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
 * Clicks an element with given locator if it's located in DOM.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @returns {Promise<WebElement>} A promise that will resolve with the located element
 */
export async function clickIfPresent( driver, locator ) {
	const element = ( await driver.findElements( locator ) )[ 0 ];
	if ( ! element ) {
		return null;
	}

	return clickWhenClickable( driver, locator );
}

export async function getElementCount( driver, locator ) {
	const elements = await driver.findElements( locator );
	return elements.length || 0;
}

/**
 * Types a key sequence on the DOM element.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {number|string} value The element's value to set
 * @param {Object} options The options object
 * @param {boolean} options.secureValue Whether the value should be displayed in case of an error
 * @param {number} options.pauseBetweenKeysMS The time between keystrokes
 * @returns {Promise<WebElement>} A promise that will resolve with the located element
 */
export function setWhenSettable(
	driver,
	locator,
	value,
	{ secureValue = false, pauseBetweenKeysMS = 0 } = {}
) {
	const locatorStr = typeof locator === 'function' ? 'by function()' : locator + '';
	let timeout = explicitWaitMS;
	let errorMessage = `for element to be settable ${ locatorStr }`;

	if ( ! secureValue ) {
		errorMessage = `${ errorMessage } to "${ value }"`;
	}

	if ( typeof pauseBetweenKeysMS === 'number' && pauseBetweenKeysMS > 0 ) {
		// Make sure that typing time is accounted for
		timeout = timeout + value.length * pauseBetweenKeysMS;
	}

	return driver.wait(
		new WebElementCondition( errorMessage, async function () {
			const element = ( await driver.findElements( locator ) )[ 0 ];
			if ( ! element ) {
				return null;
			}
			await highlightElement( driver, element );
			const currentValue = await element.getAttribute( 'value' );
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
		} ),
		timeout
	);
}

export function setCheckbox( driver, locator ) {
	return driver.findElement( locator ).then( ( checkbox ) => {
		checkbox.getAttribute( 'checked' ).then( ( checked ) => {
			if ( checked !== 'true' ) {
				return this.clickWhenClickable( driver, locator );
			}
		} );
	} );
}

export function unsetCheckbox( driver, locator ) {
	return driver.findElement( locator ).then( ( checkbox ) => {
		checkbox.getAttribute( 'checked' ).then( ( checked ) => {
			if ( checked === 'true' ) {
				return this.clickWhenClickable( driver, locator );
			}
		} );
	} );
}

/**
 * Check whether an image element is actually visible - that is rendered to the
 * screen - not just having a reference in the DOM.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {WebElement} element The image element
 * @returns {Promise<boolean>} A promise that will resolve with whether the
 * image is visible or not
 */
export async function isImageVisible( driver, element ) {
	const tagName = await element.getTagName();
	if ( tagName !== 'IMG' ) {
		throw new Error( `Element is not an image: ${ tagName }` );
	}

	return driver.executeScript( 'return arguments[ 0 ].naturalWidth > 0', element );
}

export function checkForConsoleErrors( driver ) {
	if ( config.get( 'checkForConsoleErrors' ) === true ) {
		driver
			.manage()
			.logs()
			.get( 'browser' )
			.then( function ( logs ) {
				if ( logs.length > 0 ) {
					forEach( logs, ( log ) => {
						// Ignore chrome cast errors in Chrome - http://stackoverflow.com/questions/24490323/google-chrome-cast-sender-error-if-chrome-cast-extension-is-not-installed-or-usi/26095117#26095117
						// Also ignore post message errors - this is a known limitation at present
						// Also ignore 404 errors for viewing sites or posts/pages that are private
						if (
							log.message.indexOf( 'cast_sender.js' ) === -1 &&
							log.message.indexOf( '404' ) === -1 &&
							log.message.indexOf( "Failed to execute 'postMessage' on 'DOMWindow'" ) === -1
						) {
							driver.getCurrentUrl().then( ( url ) => {
								SlackNotifier.warn( `Found console error: "${ log.message }" on url '${ url }'`, {
									suppressDuplicateMessages: true,
								} );
							} );
						}
					} );
				}
			} );
	}
}

export function getBrowserLogs( driver ) {
	return driver.manage().logs().get( logging.Type.BROWSER );
}
export function getPerformanceLogs( driver ) {
	return driver.manage().logs().get( logging.Type.PERFORMANCE );
}

export async function switchToWindowByIndex( driver, index ) {
	const currentScreenSize = driverManager.currentScreenSize();
	const handles = await driver.getAllWindowHandles();

	await driver.switchTo().window( handles[ index ] );
	if ( currentScreenSize !== 'desktop' ) {
		// Resize target window to ensure we stay in the same viewport size:
		await driverManager.resizeBrowser( driver, currentScreenSize );
	}
}

export async function numberOfOpenWindows( driver ) {
	const handles = await driver.getAllWindowHandles();
	return handles.length;
}

export async function waitForNumberOfWindows( driver, numberWindows, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return await driver.wait(
		async function () {
			const handles = await driver.getAllWindowHandles();
			return handles.length === numberWindows;
		},
		timeoutWait,
		`Timed out waiting for ${ numberWindows } browser windows`
	);
}

export async function closeCurrentWindow( driver ) {
	return await driver.close();
}

export async function ensurePopupsClosed( driver ) {
	const numWindows = await numberOfOpenWindows( driver );
	let windowIndex;
	for ( windowIndex = 1; windowIndex < numWindows; windowIndex++ ) {
		await switchToWindowByIndex( driver, windowIndex );
		await closeCurrentWindow( driver );
	}
	return switchToWindowByIndex( driver, 0 );
}

export async function refreshIfJNError( driver, timeout = 2000 ) {
	if ( dataHelper.getTargetType() !== 'JETPACK' ) {
		return false;
	}

	// Match only 503 Error codes
	const jnSiteError = by.xpath(
		"//pre[@class='error' and .='/srv/users/SYSUSER/log/APPNAME/APPNAME_apache.error.log' and //title[.='503 Service Unavailable']]"
	);

	// Match WP DB error
	const jnDBError = by.xpath( '//h1[.="Error establishing a database connection"]' );

	const refreshIfNeeded = async () => {
		const jnErrorDisplayed = await isElementEventuallyLocatedAndVisible(
			driver,
			jnSiteError,
			timeout
		);
		const jnDBErrorDisplayed = await isElementLocated( driver, jnDBError );
		if ( jnErrorDisplayed || jnDBErrorDisplayed ) {
			console.log( 'JN Error! Refreshing the page' );
			await driver.navigate().refresh();
			return await refreshIfNeeded();
		}
		return true;
	};

	return await refreshIfNeeded();
}

/**
 * Scroll element on a page to desired position
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {string} [position='center'] An element's position. Can be 'start', 'end' and 'center'
 * @returns {Promise<WebElement>} A promise that will resolve with the located element
 */
export async function scrollIntoView( driver, locator, position = 'center' ) {
	const selectorElement = await driver.findElement( locator );

	return await driver.executeScript(
		`arguments[0].scrollIntoView( { block: "${ position }", inline: "center" } )`,
		selectorElement
	);
}

export async function selectElementByText( driver, locator, text ) {
	const element = async () => {
		const allElements = await driver.findElements( locator );
		return await webdriver.promise.filter( allElements, getInnerTextMatcherFunction( text ) );
	};
	return await this.clickWhenClickable( driver, element );
}

/**
 * Waits until an element with given locator and inner text is located.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {string|RegExp} text The text the element should contain
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will resolve with the located element
 */
export async function waitUntilElementWithTextLocated(
	driver,
	locator,
	text,
	timeout = explicitWaitMS
) {
	const locatorStr = typeof locator === 'function' ? 'by function()' : locator + '';

	return driver.wait(
		new WebElementCondition(
			`for element to be located ${ locatorStr } and contain text "${ text }"`,
			async function () {
				const locatedElements = await driver.findElements( locator );
				if ( locatedElements.length === 0 ) {
					return null;
				}

				let elementsWithText;
				try {
					elementsWithText = await webdriver.promise.filter(
						locatedElements,
						getInnerTextMatcherFunction( text )
					);
				} catch ( err ) {
					if ( err instanceof webdriverError.StaleElementReferenceError ) {
						// The element was removed from the DOM after we found it. Likely it was an animation
						// or react re-render. Return null so WebElementCondition retries again.
						return null;
					}
					throw err;
				}

				if ( elementsWithText.length === 0 ) {
					return null;
				}

				return elementsWithText[ 0 ];
			}
		),
		timeout
	);
}

export function getElementByText( driver, locator, text ) {
	return async () => {
		const allElements = await driver.findElements( locator );
		return await webdriver.promise.filter( allElements, getInnerTextMatcherFunction( text ) );
	};
}

export async function dismissAlertIfPresent( driver ) {
	try {
		await driver.switchTo().alert().dismiss();
		return true;
	} catch ( error ) {
		return false;
	}
}

export async function acceptAlertIfPresent( driver ) {
	try {
		await driver.switchTo().alert().accept();
		return true;
	} catch ( error ) {
		return false;
	}
}

export async function waitForAlertPresent( driver ) {
	return await driver.wait( until.alertIsPresent(), this.explicitWaitMS, 'Alert is not present.' );
}

function getInnerTextMatcherFunction( match ) {
	return async ( element ) => {
		const elementText = await element.getText();
		if ( typeof match === 'string' ) {
			return elementText === match;
		}
		if ( match.test ) {
			return match.test( elementText );
		}
		throw new Error( 'Unknown matcher type; must be a string or a regular expression' );
	};
}

export async function waitTillTextPresent( driver, locator, text, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver.wait(
		function () {
			return driver.findElements( locator ).then(
				async function ( allElements ) {
					return await webdriver.promise.filter( allElements, getInnerTextMatcherFunction( text ) );
				},
				function () {
					return false;
				}
			);
		},
		timeoutWait,
		`Timed out waiting for element with ${ locator.using } of '${ locator.value }' to be present and displayed with text '${ text }'`
	);
}

/**
 * Waits until the input driver is able to switch to the designated frame.
 * Upon successful resolution, the driver will be left focused on the new frame.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The frame element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<boolean>} A promise that will resolve with true if the
 * switch was succesfull
 */
export function waitUntilAbleToSwitchToFrame( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.ableToSwitchToFrame( locator ), timeout );
}

/**
 * Waits until a window of a given index is ready to be switched to and switches
 * to it.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {number} windowIndex The index of the window to switch to
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<boolean>} A promise that will resolve with true if the
 * switch was succesfull
 */
export function waitUntilAbleToSwitchToWindow( driver, windowIndex, timeout = explicitWaitMS ) {
	return driver.wait(
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
 * Waits until an element stops moving. Useful for interacting with animated
 * elements.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with
 * the located element
 */
export function waitUntilElementStopsMoving( driver, locator, timeout = explicitWaitMS ) {
	const locatorStr = typeof locator === 'function' ? 'by function()' : locator + '';
	let elementX;
	let elementY;

	return driver.wait(
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
