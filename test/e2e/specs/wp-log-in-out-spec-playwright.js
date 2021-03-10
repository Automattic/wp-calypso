/**
 * External dependencies
 */
import playwright from 'playwright';
import config from 'config';

/**
 * External dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import LoginPage from '../lib/pages/login-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Playwright Canary: (${ screenSize }) @playwright @parallel`, function () {
	this.timeout( mochaTimeOut );
	let page;
	let browser;

	before( 'Start browser', async function () {
		browser = await playwright.chromium.launch( { headless: false } );
		const browserContext = await browser.newContext();
		page = await browserContext.newPage();
	} );
	describe( 'Loading the log-in screen using Playwright', function () {
		step( 'Can see the log in screen', async function () {
			const url = await LoginPage.getLoginURL();
			await page.goto( url, { waitUntill: 'networkidle' } );
		} );
	} );

	after( 'close browser', function () {
		browser.close();
	} );
} );
