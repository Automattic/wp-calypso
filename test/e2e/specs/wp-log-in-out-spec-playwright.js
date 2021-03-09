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

	describe( 'Loading the log-in screen using Playwright', function () {
		step( 'Can see the log in screen', async function () {
			const browser = await playwright.chromium.launch( { headless: false } );
			const url = await LoginPage.getLoginURL();
			const browserContext = await browser.newContext();
			const page = await browserContext.newPage();
			await page.goto( url, { waitUntill: 'networkidle' } );
			await browser.close();
		} );
	} );
} );
