import fs from 'fs/promises';
import path from 'path';
import config from 'config';
import { BrowserType } from 'playwright';
import { getHeadless, getLaunchConfiguration } from './browser-helper';
import { getCalypsoURL } from './data-helper';
import { LoginPage } from './lib/pages/login-page';
import type { Browser, BrowserContext, Logger, Page } from 'playwright';

export let browser: Browser;

export interface LaunchOptions {
	logger?: Logger;
	locale?: string;
}

/**
 * Returns a new instance of a BrowserContext object.
 *
 * A BrowserContext represents an isolated environment, akin to incognito mode.
 * Instances of BrowserContext do not share cookies or authenticated states with other contexts.
 *
 * @param {LaunchOptions} [launchOptions] Options to pass to `browser.newContext()`.
 * @returns {Promise<BrowserContext>} New BrowserContext instance.
 * @throws {Error} If no instance of a browser is found.
 */
export async function newBrowserContext(
	launchOptions?: LaunchOptions
): Promise< BrowserContext > {
	if ( ! browser ) {
		throw new Error( 'No browser instance found.' );
	}

	// Get basic configuration (devices, browser agent string, etc).
	const config = getLaunchConfiguration( browser.version() );

	// Add logging details.
	if ( launchOptions?.logger ) {
		config.logger = launchOptions.logger;
	}

	if ( launchOptions?.locale ) {
		config.locale = launchOptions.locale;
	}

	// Launch a new BrowserContext with launch configuration.
	return await browser.newContext( config );
}

/**
 * Returns a new instance of a Page object.
 *
 * If the optional parameter `context` is provivided, this method will return a
 * new instance of a Page belonging to the supplied BrowserContext.
 * Otherwise, a new instance of a Page is returned from the most recent BrowserContext.
 *
 * @param param0 Keyed object parameter.
 * @param {BrowserContext} [param0.context] BrowserContext on which the new Page should be created.
 * @returns {Promise<Page>} Instance of a new Page object.
 */
export async function newPage( { context }: { context?: BrowserContext } = {} ): Promise< Page > {
	// If caller supplies the target BrowserContext.
	if ( context ) {
		return await context.newPage();
	}

	// Default case - launch a new Page object in the most recent BrowserContext.
	const contexts = browser.contexts();
	return await contexts[ contexts.length - 1 ].newPage();
}

/**
 * Returns a new instance of a Browser.
 *
 * A Browser instance can be any one of the browser types supported by Playwright.
 * Considerable overhead and costs are incurred when launching a new Browser instance.
 * Where possible, use BrowserContexts.
 *
 * @param {BrowserType} browserType Type of browser to use.
 * @returns {Promise<Browser>} New Browser instance.
 */
export async function startBrowser( browserType: BrowserType ): Promise< Browser > {
	if ( browser ) {
		return browser;
	}

	browser = await browserType.launch( {
		headless: getHeadless(),
		args: [ '--window-position=0,0' ],
	} );
	return browser;
}

/**
 * Closes the target page passed in as parameter, and optionally closes the BrowserContext as well.
 *
 * @param {Page} page Target page to close.
 * @param param0 Parameter object.
 * @param {boolean} param0.closeContext Whether to also close the BrowserContext to which the page belongs.
 */
export async function closePage(
	page: Page,
	{ closeContext = false }: { closeContext?: boolean } = {}
): Promise< void > {
	if ( closeContext ) {
		await page.context().close();
	} else {
		await page.close();
	}
}

/**
 * Terminates the Browser instance.
 *
 * Once a Browser instance is terminated, all open contexts and pages are also terminated.
 * The terminated browser cannot be reused.
 *
 * @returns {Promise<void>} No return value.
 */
export async function closeBrowser(): Promise< void > {
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

/**
 *
 * @param page
 * @param testAccount
 */
export async function authenticateTestAccount( page: Page, testAccount: string ): Promise< void > {
	const { SAVE_AUTH_COOKIES, COOKIES_PATH } = process.env;
	const browserContext = await page.context();
	let storageStateFilePath;

	await browserContext.clearCookies();

	/**
	 * Load auth cookies from the storage state file if available.
	 */
	if ( COOKIES_PATH ) {
		storageStateFilePath = path.join( COOKIES_PATH, `${ testAccount }.json` );

		try {
			const { birthtimeMs } = await fs.stat( storageStateFilePath );
			const isFresh = birthtimeMs > Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 days

			if ( isFresh ) {
				const storageStateFile = await fs.readFile( storageStateFilePath, { encoding: 'utf8' } );
				const { cookies } = JSON.parse( storageStateFile );

				console.info( `Using stored authentication cookies for the "${ testAccount }" account.` );
				await browserContext.addCookies( cookies );
				await page.goto( getCalypsoURL( '/' ) );
				return;
			}

			console.info( `Removing stale storage state file for the "${ testAccount }" account.` );
			await fs.rm( storageStateFilePath );
		} catch ( error: unknown ) {
			const { code } = error as NodeJS.ErrnoException;
			if ( code === 'ENOENT' ) {
				console.info( `Couldn't find storage state file for the "${ testAccount }" account.` );
			} else {
				throw error;
			}
		}
	}

	/**
	 * Login via UI if storage state file is unavailable.
	 */
	const loginPage = new LoginPage( page );

	console.info( `Logging in as "${ testAccount }"` );
	await loginPage.visit();
	await loginPage.logInWithTestAccount( testAccount );

	/**
	 * Save storage state file.
	 */
	if ( SAVE_AUTH_COOKIES === 'true' ) {
		console.info( `Saving storage state file for the "${ testAccount }" account.` );
		await browserContext.storageState( { path: storageStateFilePath } );
	}
}
