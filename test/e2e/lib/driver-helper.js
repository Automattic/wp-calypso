/**
 * External dependencies
 */
import webdriver, {
	Key,
	By,
	WebDriver,
	WebElement,
	WebElementCondition,
	logging,
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
					const element = await driver.findElement( locator );
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
 * Waits until an element is located in DOM and visible. Throws an error after
 * it times out.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with
 * the located element
 */
export function waitUntilLocatedAndVisible( driver, locator, timeout = explicitWaitMS ) {
	const locatorStr = typeof locator === 'function' ? 'by function()' : locator + '';

	return driver.wait(
		new WebElementCondition(
			`for the element to become located and visible ${ locatorStr }`,
			async function () {
				const element = ( await driver.findElements( locator ) )[ 0 ];
				if ( ! element ) {
					return null;
				}
				try {
					const isDisplayed = await element.isDisplayed();
					return isDisplayed ? element : null;
				} catch ( error ) {
					// This can happen due to react re-rendering (or similar dom modification) between
					// when we resolve `findElements` and check isDisplayed.
					if ( error.name === 'StaleElementReferenceError' ) {
						console.log(
							`Ignoring StaleElementReferenceError in waitUntilLocatedAndVisible called with ${ locatorStr }`
						);
						return null;
					}
					throw error;
				}
			}
		),
		timeout
	);
}

export function isEventuallyPresentAndDisplayed( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver
		.wait( function () {
			return driver.findElement( selector ).then(
				function ( element ) {
					return element.isDisplayed().then(
						function () {
							return true;
						},
						function () {
							return false;
						}
					);
				},
				function () {
					return false;
				}
			);
		}, timeoutWait )
		.then(
			( shown ) => {
				return shown;
			},
			() => {
				return false;
			}
		);
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

export async function getElementCount( driver, selector ) {
	const elements = await driver.findElements( selector );
	return elements.length || 0;
}

export async function isElementPresent( driver, selector ) {
	const elements = await driver.findElements( selector );
	return !! elements.length;
}

export function elementIsNotPresent( driver, selector ) {
	return this.isElementPresent( driver, selector ).then( function ( isPresent ) {
		return ! isPresent;
	} );
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

export function setCheckbox( driver, selector ) {
	return driver.findElement( selector ).then( ( checkbox ) => {
		checkbox.getAttribute( 'checked' ).then( ( checked ) => {
			if ( checked !== 'true' ) {
				return this.clickWhenClickable( driver, selector );
			}
		} );
	} );
}

export function unsetCheckbox( driver, selector ) {
	return driver.findElement( selector ).then( ( checkbox ) => {
		checkbox.getAttribute( 'checked' ).then( ( checked ) => {
			if ( checked === 'true' ) {
				return this.clickWhenClickable( driver, selector );
			}
		} );
	} );
}

export function waitTillNotPresent( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;
	const self = this;

	return driver.wait(
		function () {
			return self.isElementPresent( driver, selector ).then( function ( isPresent ) {
				return ! isPresent;
			} );
		},
		timeoutWait,
		`Timed out waiting for element with ${ selector.using } of '${ selector.value }' to NOT be present`
	);
}

/**
 * Check whether an image is actually visible - that is rendered to the screen - not just having a reference in the DOM
 *
 * @param {object} driver - Browser context in which to search
 * @param {object} webElement - Element to search for
 * @returns {Promise} - Resolved when the script is done executing
 */
export function imageVisible( driver, webElement ) {
	return driver.executeScript(
		'return (typeof arguments[0].naturalWidth!="undefined" && arguments[0].naturalWidth>0)',
		webElement
	);
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

export async function ensureMobileMenuOpen( driver ) {
	if ( process.env.BROWSERSIZE !== 'mobile' ) {
		return null;
	}

	const mobileHeaderLocator = by.css( '.section-nav__mobile-header' );
	const menuLocator = by.css( '.section-nav' );
	const openMenuLocator = by.css( '.section-nav.is-open' );

	await waitUntilLocatedAndVisible( driver, menuLocator );
	const menuElement = await driver.findElement( menuLocator );
	const isMenuOpen = await menuElement
		.getAttribute( 'class' )
		.then( ( classNames ) => classNames.includes( 'is-open' ) );

	if ( ! isMenuOpen ) {
		await clickWhenClickable( driver, mobileHeaderLocator );
		await waitUntilLocatedAndVisible( driver, openMenuLocator );
	}
}

export function waitForInfiniteListLoad( driver, elementSelector, { numElements = 10 } = {} ) {
	return driver.wait( function () {
		return driver.findElements( elementSelector ).then( ( elements ) => {
			return elements.length >= numElements;
		} );
	} );
}

export async function switchToWindowByIndex( driver, index ) {
	const currentScreenSize = driverManager.currentScreenSize();
	const handles = await driver.getAllWindowHandles();
	await driver.switchTo().window( handles[ index ] );
	// Resize target window to ensure we stay in the same viewport size:
	await driverManager.resizeBrowser( driver, currentScreenSize );
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
		const jnErrorDisplayed = await isEventuallyPresentAndDisplayed( driver, jnSiteError, timeout );
		const jnDBErrorDisplayed = await isElementPresent( driver, jnDBError );
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
 * @description
 * Scroll element on a page to desired position
 *
 * @param {object} driver WebDriver
 * @param {object} selector A element's selector
 * @param {string} position An element's position. Can be 'start', 'end' and 'center'
 * @returns {Promise<void>} Promise
 */
export async function scrollIntoView( driver, selector, position = 'center' ) {
	const selectorElement = await driver.findElement( selector );

	return await driver.executeScript(
		`arguments[0].scrollIntoView( { block: "${ position }", inline: "center" } )`,
		selectorElement
	);
}

export async function selectElementByText( driver, selector, text ) {
	const element = async () => {
		const allElements = await driver.findElements( selector );
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
				const elementsWithText = await webdriver.promise.filter(
					locatedElements,
					getInnerTextMatcherFunction( text )
				);

				return elementsWithText[ 0 ];
			}
		),
		timeout
	);
}

export function getElementByText( driver, selector, text ) {
	return async () => {
		const allElements = await driver.findElements( selector );
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

export async function waitTillTextPresent( driver, selector, text, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver.wait(
		function () {
			return driver.findElements( selector ).then(
				async function ( allElements ) {
					return await webdriver.promise.filter( allElements, getInnerTextMatcherFunction( text ) );
				},
				function () {
					return false;
				}
			);
		},
		timeoutWait,
		`Timed out waiting for element with ${ selector.using } of '${ selector.value }' to be present and displayed with text '${ text }'`
	);
}

/**
 * Waits until the input driver is able to switch to the designated frame.
 * Upon successful resolution, the driver will be left focused on the new frame.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<boolean>} A promise that will resolve with true if the switch was succesfull
 */
export function waitUntilAbleToSwitchToFrame( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.ableToSwitchToFrame( locator ), timeout );
}
