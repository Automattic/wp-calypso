/**
 * External dependencies
 */
import webdriver, { WebElementCondition } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as SlackNotifier from './slack-notifier.js';
import * as dataHelper from './data-helper';
import * as driverManager from './driver-manager';

const explicitWaitMS = config.get( 'explicitWaitMS' );
const by = webdriver.By;

/**
 * A string or regular expression used to query elements by.
 *
 * @typedef {string|RegExp} ElementTextQuery
 */

/**
 * Object containing an actual WebDriver locator and a text to search the
 * element by.
 *
 * @typedef {Object} RichLocator
 * @property {webdriver.By} locator The element's locator
 * @property {ElementTextQuery} text The text to query the element by
 */

/**
 * Checks if an object contains a proper locator and a text to find an element by.
 *
 * @see findElementByText
 * @param {webdriver.By} locator The element's locator
 * @returns {boolean} Whether it's a text locator or not
 */
export function isRichLocator( locator ) {
	return typeof locator === 'object' && locator !== null && locator.text && locator.locator;
}

/**
 * Stringifies the locator object. Useful for error reporting or logging.
 *
 * @param {webdriver.By|RichLocator} locator The element's locator
 * @returns {string} Printable version of the locator
 */
export function getLocatorString( locator ) {
	let loc = locator;
	let txt;

	if ( isRichLocator( locator ) ) {
		loc = locator.locator;
		txt = locator.text;
	}

	const locString = typeof loc === 'function' ? 'by function()' : loc + '';

	if ( ! txt ) {
		return locString;
	}

	return `${ locString } and text "${ txt }"`;
}

/**
 * Checks if the text passed to find an element by is valid. Throws an error if
 * it's not.
 *
 * @param {string} text The string argument to check
 * @returns {ElementTextQuery} The same string if it's a valid element query
 * @throws {TypeError}
 */
export function checkedElementTextQuery( text ) {
	if (
		( typeof text === 'string' && text.length > 0 ) ||
		( typeof text === 'object' && text.constructor.name === 'RegExp' )
	) {
		return text;
	}

	throw new TypeError( 'Invalid text locator' );
}

const until = {
	...webdriver.until, // Merge with original 'untils' for convenience.

	/**
	 * Creates a condition that will loop until element is located.
	 *
	 * @param {webdriver.By|RichLocator} locator The element's locator
	 * @returns {webdriver.WebElementCondition} The new condition
	 */
	elementLocated( locator ) {
		if ( isRichLocator( locator ) ) {
			return this.elementWithTextLocated( locator.locator, locator.text );
		}
		return webdriver.until.elementLocated( locator );
	},

	/**
	 * Creates a condition that will loop until element with given text is
	 * located.
	 *
	 * @param {webdriver.By} locator The element's locator
	 * @param {string|RegExp} text The text or regular expression the element should contain
	 * @returns {webdriver.WebElementCondition} The new condition
	 */
	elementWithTextLocated( locator, text ) {
		const validText = checkedElementTextQuery( text );
		const locatorStr = getLocatorString( locator );

		return new WebElementCondition(
			`for element to be located ${ locatorStr }`,
			function ( driver ) {
				return findElementByText( driver, locator, validText );
			}
		);
	},

	/**
	 * Creates a condition that will loop until element's aria-disabled attribute
	 * is not 'true'.
	 *
	 * @param {webdriver.WebElement} element The element to test
	 * @returns {webdriver.WebElementCondition} The new condition
	 */
	elementIsAriaEnabled( element ) {
		return new WebElementCondition( 'until element is not aria-disabled', function () {
			return element
				.getAttribute( 'aria-disabled' )
				.then( ( v ) => ( v !== 'true' ? element : null ) );
		} );
	},
};

export async function highlightElement( driver, element ) {
	if ( process.env.HIGHLIGHT_ELEMENT === 'true' ) {
		return await driver.executeScript(
			"arguments[0].setAttribute('style', 'background: gold; border: 2px solid red;');",
			element
		);
	}
}

/**
 * Finds an element via given locator.
 *
 * @param {webdriver.WebDriver} driver The current driver instance
 * @param {webdriver.By|RichLocator} locator The element's locator
 * @returns {webdriver.WebElement} The located element
 */
export function findElement( driver, locator ) {
	if ( isRichLocator( locator ) ) {
		return findElementByText( driver, locator.locator, locator.text );
	}
	return driver.findElement( locator );
}

/**
 * Finds an element via given locator and text.
 *
 * @param {webdriver.WebDriver} driver The current driver instance
 * @param {webdriver.By} locator The element's locator
 * @param {ElementTextQuery} text The element's text
 * @returns {webdriver.WebElement} The located element
 */
export async function findElementByText( driver, locator, text ) {
	const validText = checkedElementTextQuery( text );
	const allElements = await driver.findElements( locator );
	const filteredElements = await webdriver.promise.filter(
		allElements,
		getInnerTextMatcherFunction( validText )
	);

	return filteredElements[ 0 ];
}

/**
 * Waits for the element to become located and visible. Throws an error after it
 * times out.
 *
 * @param {webdriver.WebDriver} driver The current driver instance
 * @param {webdriver.By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {webdriver.WebElement} The located element
 */
export async function waitUntilLocatedAndVisible( driver, locator, timeout = explicitWaitMS ) {
	function wait( condition ) {
		return driver.wait( condition, timeout );
	}

	try {
		const element = await wait( until.elementLocated( locator ) );
		await wait( until.elementIsVisible( element ) );

		return element;
	} catch ( error ) {
		const locatorStr = getLocatorString( locator );
		error.message = `Couldn't locate ${ locatorStr } or element invisible\n${ error.message }`;

		throw error;
	}
}

/**
 * Checks if an element eventually becomes located and visible. Returns false
 * after it times out.
 *
 * @param {webdriver.WebDriver} driver The current driver instance
 * @param {webdriver.By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {boolean} Whether the element was found or not
 */
export function isEventuallyLocatedAndVisible( driver, locator, timeout = explicitWaitMS ) {
	return waitUntilLocatedAndVisible( driver, locator, timeout ).then(
		( element ) => !! element,
		() => false
	);
}

/**
 * Clicks an element once it becomes (aria-)enabled. Throws an error after it
 * times out.
 *
 * @param {webdriver.WebDriver} driver The current driver instance
 * @param {webdriver.By|RichLocator} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {webdriver.WebElement} The clicked element
 * @throws {*}
 */
export async function clickWhenClickable( driver, locator, timeout = explicitWaitMS ) {
	function wait( condition ) {
		return driver.wait( condition, timeout );
	}

	try {
		const element = await wait( until.elementLocated( locator ) );
		await highlightElement( driver, element );
		await wait( until.elementIsEnabled( element ) );
		await wait( until.elementIsAriaEnabled( element ) );

		try {
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
	} catch ( error ) {
		const locatorStr = getLocatorString( locator );
		error.message = `Couldn't click element ${ locatorStr }\n${ error.message }`;

		throw error;
	}
}

export function waitTillFocused( driver, selector, pollingOverride, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;
	const timeoutPolling = pollingOverride ? pollingOverride : explicitWaitMS;

	return driver.wait(
		function () {
			return driver.findElement( selector ).then(
				async function ( element ) {
					// Poll if element is active every 100 ms until focused or until timeoutPolling is reached
					for ( let i = 0; i < timeoutPolling / 100; i++ ) {
						const isFocused =
							( await driver.switchTo().activeElement().getId() ) === ( await element.getId() );
						if ( isFocused ) {
							return true;
						}
						await driver.sleep( 100 );
					}
					return false;
				},
				function () {
					return false;
				}
			);
		},
		timeoutWait,
		`Timed out waiting for element with ${ selector.using } of '${ selector.value }' to be focused`
	);
}

export function followLinkWhenFollowable( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;
	return driver.wait(
		function () {
			return driver.findElement( selector ).then(
				function ( element ) {
					return element.getAttribute( 'href' ).then(
						function ( href ) {
							driver.get( href );
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
		},
		timeoutWait,
		`Timed out waiting for link with ${ selector.using } of '${ selector.value }' to be followable`
	);
}

export function waitTillSelected( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver.wait(
		function () {
			return driver.findElement( selector ).then(
				function ( element ) {
					return element.isSelected().then(
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
		},
		timeoutWait,
		`Timed out waiting for element with ${ selector.using } of '${ selector.value }' to be selected`
	);
}

export function clickIfPresent( driver, selector, attempts ) {
	if ( attempts === undefined ) {
		attempts = 1;
	}
	for ( let x = 0; x < attempts; x++ ) {
		driver.findElement( selector ).then(
			async function ( element ) {
				await highlightElement( driver, element );
				element.click().then(
					function () {
						return true;
					},
					function () {
						return true;
					}
				);
			},
			function () {
				return true;
			}
		);
	}
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

export function waitForFieldClearable( driver, selector ) {
	return driver.wait(
		function () {
			return driver.findElement( selector ).then(
				async ( element ) => {
					await driver.executeScript( "arguments[0].value = '';", element );
					return element.clear().then(
						function () {
							return element.getAttribute( 'value' ).then( ( value ) => {
								return value === '';
							} );
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
		},
		explicitWaitMS,
		`Timed out waiting for element with ${ selector.using } of '${ selector.value }' to be clearable`
	);
}

export function setWhenSettable(
	driver,
	selector,
	value,
	{ secureValue = false, pauseBetweenKeysMS = 0 } = {}
) {
	const self = this;
	const logValue = secureValue === true ? '*********' : value;

	return driver.wait(
		async function () {
			await self.waitForFieldClearable( driver, selector );
			const element = await driver.findElement( selector );
			await highlightElement( driver, element );
			if ( pauseBetweenKeysMS === 0 ) {
				await element.sendKeys( value );
			} else {
				for ( let i = 0; i < value.length; i++ ) {
					await driver.sleep( pauseBetweenKeysMS );
					await element.sendKeys( value[ i ] );
				}
			}
			const newElement = await driver.findElement( selector );
			const actualValue = await newElement.getAttribute( 'value' );
			return actualValue === value;
		},
		explicitWaitMS,
		`Timed out waiting for element with ${ selector.using } of '${ selector.value }' to be settable to: '${ logValue }'`
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
					logs.forEach( ( log ) => {
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

export function printConsole( driver ) {
	if ( config.get( 'printConsoleLogs' ) === true ) {
		driver
			.manage()
			.logs()
			.get( 'browser' )
			.then( ( logs ) => {
				logs.forEach( ( log ) => console.log( log ) );
			} );
	}
}

export function logPerformance( driver ) {
	if ( config.get( 'logNetworkRequests' ) === true ) {
		driver
			.manage()
			.logs()
			.get( 'performance' )
			.then( ( browserLogs ) => {
				browserLogs.forEach( ( browserLog ) => {
					const message = JSON.parse( browserLog.message ).message;
					if (
						message.method === 'Network.responseReceived' ||
						message.method === 'Network.requestWillBeSent'
					) {
						console.log( JSON.stringify( message ) );
					}
				} );
			} );
	}
}

export async function ensureMobileMenuOpen( driver ) {
	if ( driverManager.currentScreenSize() !== 'mobile' ) {
		return null;
	}

	const mobileHeaderLocator = by.css( '.section-nav__mobile-header' );
	const menuLocator = by.css( '.section-nav' );
	const openMenuLocator = by.css( '.section-nav.is-open' );

	const menuElement = await waitUntilLocatedAndVisible( driver, menuLocator );
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
		const jnErrorDisplayed = await isEventuallyLocatedAndVisible( driver, jnSiteError, timeout );
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

export async function clearTextArea( driver, selector ) {
	const textArea = await driver.findElement( selector );
	const textValue = await textArea.getText();
	let i = textValue.length;
	while ( i > 0 ) {
		await textArea.sendKeys( webdriver.Key.BACK_SPACE );
		i--;
	}
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
