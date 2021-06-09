/**
 * @file Helps manage browser instance.
 * @author Edwin Takahashi
 */

/**
 * External dependencies
 */
import { chromium } from 'playwright';
import config from 'config';
import * as fs from 'fs/promises';
import type { Browser, BrowserContext, Page } from 'playwright';

/**
 * Internal dependencies
 */
import { getVideoDir, getDateString, getAssetDir } from './media-helper';
import { getViewportSize } from './browser-helper';

/**
 * Type dependencies
 */
import { viewportSize } from './types';

export let browser: Browser;

/**
 * Familiar entrypoint to initialize the browser from a test writer's perspective.
 *
 * @returns {Promise<Page>} New Page instance.
 */
export async function start(): Promise< Page > {
	return await launchPage();
}

/**
 * Returns a new instance of a Page.
 *
 * This function wraps and sets additional parameters before returning a new instance
 * of a Page.
 * Page represents a tab in a browser where the actual test are run.
 *
 * @returns {Promise<Page>} New Page instance.
 */
export async function launchPage(): Promise< Page > {
	const browserContext = await launchBrowserContext();
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
 * @returns {Promise<BrowserContext>} New BrowserContext instance.
 */
export async function launchBrowserContext(): Promise< BrowserContext > {
	// If no existing instance of a Browser, then launch a new instance.
	if ( ! browser ) {
		browser = await launchBrowser();
	}

	// By default, record video for each browser context.
	const videoDir = getVideoDir();
	const dimension: viewportSize = getViewportSize();
	const timestamp = getDateString();
	const userAgent = `user-agent=Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ await browser.version() } Safari/537.36`;

	// Generate a new BrowserContext.
	return await browser.newContext( {
		viewport: null, // Do not override window size set in the browser launch parameters.
		recordVideo: { dir: videoDir, size: { width: dimension.width, height: dimension.height } },
		userAgent: userAgent,
		logger: {
			isEnabled: ( name ) => name === 'api',
			log: ( name, severity, message ) =>
				writeLog( { name: name, severity: severity, message: message }, timestamp ),
		},
	} );
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

	const dimension: viewportSize = getViewportSize();

	return await chromium.launch( {
		headless: isHeadless,
		args: [ '--window-position=0,0', `--window-size=${ dimension.width },${ dimension.height }` ],
	} );
}

/**
 * Function that writes to a log file.
 *
 * @param {Object} param0 Object assembled by caller containing details to be written to logfile.
 * @param {string} param0.name Debug level.
 * @param {string} param0.severity Log severity.
 * @param {string} param0.message Action taken by Playwright library.
 * @param {string} timestamp Timestamp when the logging handler was created.
 * @returns {Promise<void>} No return value.
 */
async function writeLog(
	{ name, severity, message }: { name: string; severity: string | Error; message: string | Error },
	timestamp: string
): Promise< void > {
	await fs.appendFile(
		`${ getAssetDir() }/playwright-${ timestamp }.log`,
		`${ process.pid } ${ name } ${ severity } ${ message }\n`
	);
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
 * Given a page, this will clear the cookies for the context to which the page belongs.
 *
 * @param {Page} page Object representing a page launched by Playwright.
 * @returns {Promise<void>} No return value.
 */
export async function clearCookies( page: Page ): Promise< void > {
	await page.context().clearCookies();
}
