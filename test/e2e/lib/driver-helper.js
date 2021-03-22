/**
 * External dependencies
 */
import webdriver, { By, WebDriver, WebElement, WebElementCondition } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as SlackNotifier from './slack-notifier.js';
import * as dataHelper from './data-helper';
import * as driverManager from './driver-manager';

const { NoSuchElementError } = webdriver.error;
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

export const until = {
	...webdriver.until, // Merge with original 'untils' for convenience.


	elementNotLocated( locator ) {
		
		const element = ( await findElements( driver, locator ) )[ 0 ];

		return ! element ? true : element;
	},

	/**
	 * Creates a condition that will loop until element is located and visible.
	 *
	 * @param {By} locator The element's locator
	 * @returns {WebElementCondition} The new condition
	 */
	elementIsLocatedAndVisible( locator ) {
		return new WebElementCondition(
			`for element to be located and visible ${ getLocatorString( locator ) }`,
			async function ( driver ) {
				const element = ( await driver.findElements( locator ) )[ 0 ];
				if ( ! element ) {
					return null;
				}
				const isDisplayed = await element.isDisplayed();

				return isDisplayed ? element : null;
			}
		);
	},

	/**
	 * Creates a condition that will loop until element is clickable. A clickable
	 * element must be located and not (aria-)disabled.
	 *
	 * @param {By} locator The element's locator
	 * @returns {WebElementCondition} The new condition
	 */
	elementIsClickable( locator ) {
		const locatorStr = getLocatorString( locator );

		return new WebElementCondition(
			`for element to be clickable ${ locatorStr }`,
			async function ( driver ) {
				const element = ( await driver.findElements( locator ) )[ 0 ];
				if ( ! element ) {
					return null;
				}
				const isEnabled = await element.isEnabled();
				const isAriaEnabled = await element
					.getAttribute( 'aria-disabled' )
					.then( ( v ) => v !== 'true' );

				return isEnabled && isAriaEnabled ? element : null;
			}
		);
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
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @returns {Promise<WebElement>} A promise that will resolve with the located element
 */
export async function findElement( driver, locator ) {
	if ( isRichLocator( locator ) ) {
		const elements = await findElements( driver, locator );

		if ( ! elements[ 0 ] ) {
			const locatorStr = getLocatorString( locator );
			throw new NoSuchElementError( `Unable to locate element ${ locatorStr }` );
		}
		return elements[ 0 ];
	}
	return driver.findElement( locator );
}

/**
 * Finds elements via given locator and text.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @returns {Promise<WebElement>} A promise that will resolve with the located elements
 */
export async function findElements( driver, locator ) {
	if ( ! isRichLocator( locator ) ) {
		return driver.findElements( locator );
	}
	const innerText = checkedElementInnerText( locator.text );
	const allElements = await driver.findElements( locator.locator );

	if ( Array.isArray( allElements ) && allElements.length > 0 ) {
		return webdriver.promise.filter( allElements, getInnerTextMatcherFunction( innerText ) );
	}
	return [];
}

/**
 * Waits for the element to become located and visible. Throws an error after it
 * times out.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<WebElement>} A promise that will be resolved with
 * the located and visible element
 */
export function waitUntilLocatedAndVisible( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementIsLocatedAndVisible( locator ), timeout );
}

/**
 * Checks if an element eventually becomes located and visible. Returns false
 * after it times out.
 *
 * @param {WebDriver} driver The parent WebDriver instance
 * @param {By} locator The element's locator
 * @param {number} [timeout=explicitWaitMS] The timeout in milliseconds
 * @returns {Promise<boolean>} A promise that will be resolved with whether the
 * element is located and visible on the page
 */
export function isEventuallyLocatedAndVisible( driver, locator, timeout = explicitWaitMS ) {
	return waitUntilLocatedAndVisible( driver, locator, timeout ).then(
		( element ) => !! element,
		() => false
	);
}

export async function getElementCount( driver, locator ) {
	const elements = await findElements( driver, locator );
	return elements.length;
}

export async function isElementLocated( driver, locator ) {
	const elements = await findElements( driver, locator );
	return !! elements.length;
}

export async function isElementNotLocated( driver, locator ) {
	const elements = await findElements( driver, locator );
	return ! elements.length;
}

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

	const mobileHeaderLocator = By.css( '.section-nav__mobile-header' );
	const menuLocator = By.css( '.section-nav' );
	const openMenuLocator = By.css( '.section-nav.is-open' );

	const menuElement = await waitUntilLocatedAndVisible( driver, menuLocator );
	const isMenuOpen = await menuElement
		.getAttribute( 'class' )
		.then( ( classNames ) => classNames.includes( 'is-open' ) );

	if ( ! isMenuOpen ) {
		await clickWhenClickable( driver, mobileHeaderLocator );
		await waitUntilLocatedAndVisible( driver, openMenuLocator );
	}
}

//unused
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
	const jnSiteError = By.xpath(
		"//pre[@class='error' and .='/srv/users/SYSUSER/log/APPNAME/APPNAME_apache.error.log' and //title[.='503 Service Unavailable']]"
	);

	// Match WP DB error
	const jnDBError = By.xpath( '//h1[.="Error establishing a database connection"]' );

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
