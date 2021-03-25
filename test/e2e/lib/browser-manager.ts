/**
 * @file Manages instance of Playwright Browser and BrowserContext.
 * @author Edwin Takahashi
 */

/**
 * External dependencies
 */
import { chromium } from 'playwright';
import config from 'config';
import type { Browser, BrowserContext } from 'playwright';

/**
 * Internal dependencies
 */
import type { screenSize, localeCode } from './types';

const browserStartTimeoutMS = 2000;

export let browser: Browser;

/**
 * Returns the target screen size for tests to run against.
 *
 * By default, this function will return 'desktop' as the target.
 * To specify another screen size, set the BROWSERSIZE environment variable.
 *
 * @returns {screenSize} Target screen size.
 */
export function getTargetScreenSize(): screenSize {
	return ! process.env.BROWSERSIZE
		? 'desktop'
		: ( process.env.BROWSERSIZE.toLowerCase() as screenSize );
}

/**
 * Returns the locale under test.
 *
 * By default, this function will return 'en' as the locale.
 * To set the locale, set the BROWSERLOCALE environment variable.
 *
 * @returns {localeCode} Target locale code.
 */
export function getTargetLocale(): localeCode {
	return ! process.env.BROWSERLOCALE ? 'en' : process.env.BROWSERLOCALE.toLowerCase();
}

/**
 * Returns a set of screen dimensions in numbers.
 *
 * This function takes the output of `getTargetScreenSize` and returns an
 * object key/value mapping of the screen diemensions represented by
 * the output.
 *
 * @returns {number, number} Object with key/value mapping of screen dimensions.
 * @throws {Error} If target screen size was not set.
 */
export function getScreenDimension(): { width: number; height: number } {
	switch ( getTargetScreenSize() ) {
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
 * @returns {Promise<BrowserContext>} New BrowserContext instance.
 */
export async function newBrowserContext(): Promise< BrowserContext > {
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
 * @returns {Promise<Browser>} New Browser instance.
 */
export async function launchBrowser(): Promise< Browser > {
	const isHeadless = process.env.HEADLESS === 'true' || config.has( 'headless' );

	const dimension = getScreenDimension();
	return await chromium.launch( {
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
 * @returns {void} No return value.
 */
export function quitBrowser(): void {
	browser.close();
}
