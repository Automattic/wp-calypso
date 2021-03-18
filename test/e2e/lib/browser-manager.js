/**
 * @file Manages instance of Playwright Browser and BrowserContext.
 * @author Edwin Takahashi
 */

/**
 * External dependencies
 */
import config from 'config';
import playwright from 'playwright';

const browserStartTimeoutMS = 2000;

export let browser;

/**
 * Returns the target screen size for tests to run against.
 *
 * By default, this function will return 'desktop' as the target.
 * To specify another screen size, set the BROWSERSIZE environment variable.
 *
 * @returns {string} String representation of the target screen size.
 */
export function targetScreenSize() {
	return ! process.env.BROWSERSIZE ? 'desktop' : process.env.BROWSERSIZE.toLowerCase();
}

/**
 * Returns the locale under test.
 *
 * By default, this function will return 'en' as the locale.
 * To set the locale, set the BROWSERLOCALE environment variable.
 *
 * @returns {string} String representation of the locale.
 */
export function targetLocale() {
	return ! process.env.BROWSERLOCALE ? 'en' : process.env.BROWSERLOCALE.toLowerCase();
}

/**
 * Returns a set of screen dimensions in numbers.
 *
 * This function takes the string output of `targetScreenSize` and returns an object
 * key/value mapping of the screen diemensions represented by the string.
 *
 * @returns {Number, Number} Object with key/value mapping of screen dimensions.
 */
export function getScreenDimension() {
	switch ( targetScreenSize() ) {
		case 'mobile':
			return { width: 400, height: 1000 };
		case 'tablet':
			return { width: 1024, height: 1000 };
		case 'desktop':
			return { width: 1440, height: 1000 };
		case 'laptop':
			return { width: 1400, height: 790 };
		default:
			throw new Error( 'Unsupported screen size specified.' );
	}
}

/**
 * Returns a new instance of a BrowserContext.
 *
 * A BrowserContext represents an isolated environment, akin to incognito mode
 * inside which a single test suite is run.
 * BrowserContexts are cheap to create and incur low overhead costs while allowing
 * for parallelization of test suites.
 *
 * @returns {Promise<playwright.BrowserContext>} New BrowserContext instance.
 */
export async function newBrowserContext() {
	// If no existing instance of a Browser, then launch a new instance.
	if ( ! browser ) {
		browser = await launchBrowser();
	}

	// Generate a new BrowserContext.
	return await browser.newContext( {
		viewport: null, // Do not override window size set in the browser launch parameters.
	} );
}

/**
 * Returns a new instance of a Browser.
 *
 * A Browser instance can be any one of the browser types supported by Playwright.
 * Considerable overhead and costs are incurred when launching a new Browser instance.
 *
 * @returns {Promise<playwright.Browser>} New Browser instance.
 */
export async function launchBrowser() {
	const isHeadless =
		process.env.HEADLESS === 'true' || config.has( 'headless' ) === 'true' ? true : false;

	const dimension = getScreenDimension();
	return await playwright.chromium.launch( {
		headless: isHeadless,
		args: [ '--window-position=0,0', `--window-size=${ dimension.width },${ dimension.height }` ],
		timeout: browserStartTimeoutMS,
	} );
}

/**
 * Terminates an instance of the Browser.
 *
 * When called, this function will unset the reference to the browser instance,
 * then call on the browser to terminate all instances of existing BrowserContexts.
 * Any open pages are also destroyed in this process.
 *
 */
export function quitBrowser() {
	browser.close();
	browser = undefined;
}
