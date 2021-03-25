/**
 * External dependencies
 */
import webdriver, { By, WebDriver, WebElement } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as SlackNotifier from './slack-notifier.js.js';
import * as dataHelper from './data-helper';
import * as driverManager from './driver-manager';
import * as until from './until';
import { resolveToBool } from './utils';

const explicitWaitMS = config.get( 'explicitWaitMS' );

/**
 * waitUntil<Condition> helpers
 */

export function waitUntilElementLocated( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( webdriver.until.elementLocated( locator ), timeout );
}

export function waitUntilElementNotLocated( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementNotLocated( locator ), timeout );
}

export function waitUntilElementLocatedAndVisible( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementLocatedAndVisible( locator ), timeout );
}

export function waitUntilElementClickable( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementClickable( locator ), timeout );
}

export function waitUntilElementSelected( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementSelected( locator ), timeout );
}

export function waitUntilElementFocused( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementFocused( locator ), timeout );
}

export function waitUntilImageVisible( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.imageVisible( locator ), timeout );
}

export function waitUntilFieldClearable( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.fieldClearable( locator ), timeout );
}

export function waitUntilAlertPresent( driver, timeout = explicitWaitMS ) {
	return driver.wait( webdriver.until.alertIsPresent(), timeout );
}

export function waitUntilNumberOfWindowsOpen( driver, number, timeout = explicitWaitMS ) {
	return driver.wait( until.numberOfWindowsOpen( number ), timeout );
}

/**
 * is<Condition> helpers
 */

export function isElementLocated( driver, locator ) {
	const condition = webdriver.until.elementLocated( locator );
	return resolveToBool( condition.fn( driver ) );
}

export function isElementNotLocated( driver, locator ) {
	const condition = until.elementNotLocated( locator );
	return resolveToBool( condition.fn( driver ) );
}

export function isElementLocatedAndVisible( driver, locator ) {
	const condition = until.elementLocatedAndVisible( locator );
	return resolveToBool( condition.fn( driver ) );
}

export function isElementClickable( driver, locator ) {
	const condition = until.elementClickable( locator );
	return resolveToBool( condition.fn( driver ) );
}

export function isElementSelected( driver, locator ) {
	const condition = until.elementSelected( locator );
	return resolveToBool( condition.fn( driver ) );
}

export function isElementFocused( driver, locator ) {
	const condition = until.elementFocused( locator );
	return resolveToBool( condition.fn( driver ) );
}

export function isImageVisible( driver, locator ) {
	const condition = until.imageVisible( locator );
	return resolveToBool( condition.fn( driver ) );
}

export function isFieldClearable( driver, locator ) {
	const condition = until.fieldClearable( locator );
	return resolveToBool( condition.fn( driver ) );
}

/**
 * isEventually<Condition> helpers
 */

export function isEventuallyElementLocated( driver, locator ) {
	return resolveToBool( waitUntilElementLocated( driver, locator ) );
}

export function isEventuallyElementNotLocated( driver, locator ) {
	return resolveToBool( waitUntilElementNotLocated( driver, locator ) );
}

export function isEventuallyElementLocatedAndVisible( driver, locator ) {
	return resolveToBool( waitUntilElementLocatedAndVisible( driver, locator ) );
}

export function isEventuallyElementClickable( driver, locator ) {
	return resolveToBool( waitUntilElementClickable( driver, locator ) );
}

export function isEventuallyElementSelected( driver, locator ) {
	return resolveToBool( waitUntilElementSelected( driver, locator ) );
}

export function isEventuallyElementFocused( driver, locator ) {
	return resolveToBool( waitUntilElementFocused( driver, locator ) );
}

export function isEventuallyImageVisible( driver, locator ) {
	return resolveToBool( waitUntilImageVisible( driver, locator ) );
}

export function isEventuallyFieldClearable( driver, locator ) {
	return resolveToBool( waitUntilFieldClearable( driver, locator ) );
}

// it's used once, let's remove it
export async function getElementCount( driver, locator ) {
	const elements = await driver.findElements( driver, locator );
	return elements.length;
}

// this one's used only here, no reason for extracting it
async function getOpenWindowsCount( driver ) {
	const handles = await driver.getAllWindowHandles();
	return handles.length;
}

/**
 * User actions
 */

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

	switchToWindowByIndex( driver, 0 );
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

export async function clickIfPresent( driver, selector, attempts ) {
	if ( attempts === undefined ) {
		attempts = 1;
	}
	for ( let x = 0; x < attempts; x++ ) {
		await driver.findElement( selector ).then(
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
			// the parent wait won't work because it has the same timeout as the one below
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

// move to a new SectionNavComponent
export async function ensureMobileMenuOpen( driver ) {
	if ( driverManager.currentScreenSize() !== 'mobile' ) {
		return null;
	}

	const mobileHeaderLocator = By.css( '.section-nav__mobile-header' );
	const menuLocator = By.css( '.section-nav' );
	const openMenuLocator = By.css( '.section-nav.is-open' );

	const menuElement = await waitUntilElementLocatedAndVisible( driver, menuLocator );
	const isMenuOpen = await menuElement
		.getAttribute( 'class' )
		.then( ( classNames ) => classNames.includes( 'is-open' ) );

	if ( ! isMenuOpen ) {
		await clickWhenClickable( driver, mobileHeaderLocator );
		await waitUntilElementLocatedAndVisible( driver, openMenuLocator );
	}
}

// replace with closeAllWindows()
export async function ensurePopupsClosed( driver ) {
	const numWindows = await getOpenWindowsCount( driver );
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
		const jnErrorDisplayed = await isEventuallyElementLocatedAndVisible(
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
 * Scrolls to an element so that it's visible to the user.
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

// can we use clearWhenClearable() here?
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

/**
 * Other actions
 */

export function checkForConsoleErrors( driver ) {
	if ( config.get( 'checkForConsoleErrors' ) !== true ) {
		return null;
	}
	return driver
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

export function printConsole( driver ) {
	if ( config.get( 'printConsoleLogs' ) !== true ) {
		return null;
	}
	return driver
		.manage()
		.logs()
		.get( 'browser' )
		.then( ( logs ) => {
			logs.forEach( ( log ) => console.log( log ) );
		} );
}

export function logPerformance( driver ) {
	if ( config.get( 'logNetworkRequests' ) !== true ) {
		return null;
	}
	return driver
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

export async function highlightElement( driver, element ) {
	if ( process.env.HIGHLIGHT_ELEMENT === 'true' ) {
		return await driver.executeScript(
			"arguments[0].setAttribute('style', 'background: gold; border: 2px solid red;');",
			element
		);
	}
}
