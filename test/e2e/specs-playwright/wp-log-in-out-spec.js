/**
 * External dependencies
 */

import playwright from 'playwright';

import LoginPage from '../lib/pages/login-page';

describe( `Auth Screen @canary @parallel`, function () {
	this.timeout( 30000 );
	let page;
	let browser;

	before( 'Start browser', async function () {
		browser = await playwright.chromium.launch( {
			args: [ '--disable-dev-shm-usage' ],
			headless: false,
		} );
		const browserContext = await browser.newContext();
		page = await browserContext.newPage();
	} );

	describe( 'Loading the log-in screen using Playwright', function () {
		step( 'Can see the log in screen', async function () {
			const url = LoginPage.getLoginURL();
			await page.goto( url, { waitUntill: 'networkidle' } );
		} );
	} );

	after( 'close browser', function () {
		browser.close();
	} );
} );
