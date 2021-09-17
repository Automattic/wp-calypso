/**
 * @file Helps manage browser instance.
 * @author Edwin Takahashi
 */

import config from 'config';
import { chromium } from 'playwright';
import { getLaunchConfiguration } from './browser-helper';
import type { Browser, BrowserContext, Logger, Page } from 'playwright';

export let browser: Browser;

export interface LaunchOptions {
	logger: Logger[ 'log' ];
}

/**
 * Familiar entrypoint to initialize the browser from a test writer's perspective.
 *
 * @param launchOptions Options to pass to `browser.newContext()`.
 * @returns {Promise<Page>} New Page instance.
 */
export async function start( launchOptions: LaunchOptions ): Promise< Page > {
	return await launchPage( launchOptions );
}

/**
 * Returns a new instance of a Page.
 *
 * This function wraps and sets additional parameters before returning a new instance
 * of a Page.
 * Page represents a tab in a browser where the actual test are run.
 *
 * @param launchOptions Options to pass to `browser.newContext()`.
 * @returns {Promise<Page>} New Page instance.
 */
export async function launchPage( launchOptions: LaunchOptions ): Promise< Page > {
	const browserContext = await launchBrowserContext( launchOptions );
	return await browserContext.newPage();
}

/**
 * Returns a new instance of a BrowserContext.
 *
 * A BrowserContext represents an isolated environment, akin to incognito mode
 * inside which a single test suite is run.
 * BrowserContexts are cheap to create and incur low overhead costs while allowing
 * for parallelization of test suites.
 *
 * @param options Options to pass to `browser.newContext()`.
 * @param {Logger} options.logger Logger sink for Playwright logging.
 * @returns {Promise<BrowserContext>} New BrowserContext instance.
 */
export async function launchBrowserContext( { logger }: LaunchOptions ): Promise< BrowserContext > {
	// If no existing instance of a Browser, then launch a new instance.
	if ( ! browser ) {
		browser = await launchBrowser();
	}

	return await browser.newContext( getLaunchConfiguration( browser.version(), { logger } ) );
}

/**
 * Returns a new instance of a Browser.
 *
 * A Browser instance can be any one of the browser types supported by Playwright.
 * Considerable overhead and costs are incurred when launching a new Browser instance.
 * Where possible, use BrowserContexts.
 *
 * @returns {Promise<Browser>} New Browser instance.
 */
export async function launchBrowser(): Promise< Browser > {
	const isHeadless = process.env.HEADLESS === 'true' || config.has( 'headless' );

	return await chromium.launch( {
		headless: isHeadless,
		args: [ '--window-position=0,0' ],
	} );
}

/**
 * Terminates the Browser instance.
 *
 * Once a Browser instance is terminated, all open contexts and pages are also terminated.
 * The terminated browser cannot be reused.
 *
 * @returns {Promise<void>} No return value.
 */
export async function close(): Promise< void > {
	if ( browser ) {
		await browser.close();
	} else {
		console.log( 'Browser instance was not found.' );
		return;
	}
}

/**
 * Given a page, this will clear all cookies, local storage and reset permissions for the
 * Browser Context to which the page belongs.
 *
 * @param {Page} page Object representing a page launched by Playwright.
 * @returns {Promise<void>} No return value.
 */
export async function clearAuthenticationState( page: Page ): Promise< void > {
	// Save references to the BrowserContext and the current URL the page is on.
	const browserContext = page.context();
	const currentURL = page.url();

	// Navigate to the WordPress.com base URL.
	await page.goto( 'https://r-login.wordpress.com/' );
	// Clear local storage.
	await page.evaluate( 'localStorage.clear();' );
	// Lastly, clear the cookies using built-in method.
	await browserContext.clearCookies();
	// Previous steps navigated page away from target page. Return page to the original URL.
	await page.goto( currentURL );
}

/**
 * Sets the store cookie, used for simulating payment processing.
 *
 * Optinally, set the `currency` parameter to specify the currency to be used in the checkout.
 *
 * @param {Page} page Object representing a page launched by Playwright.
 * @param {string} currency ISO 4217-compliant currency code.
 */
export async function setStoreCookie(
	page: Page,
	{ currency }: { currency?: string } = {}
): Promise< void > {
	const browserContext = page.context();

	await browserContext.addCookies( [
		{
			name: 'store_sandbox',
			value: config.get( 'storeSandboxCookieValue' ) as string,
			domain: '.wordpress.com',
			path: '/',
			sameSite: 'None',
			secure: true,
		},
	] );

	if ( currency ) {
		await browserContext.addCookies( [
			{
				name: 'landingpage_currency',
				value: currency,
				domain: '.wordpress.com',
				path: '/',
				sameSite: 'None',
				secure: true,
			},
		] );
	}
}
