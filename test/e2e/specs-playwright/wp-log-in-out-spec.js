/**
 * External dependencies
 */
import config from 'config';
import { BrowserManager } from '@automattic/calypso-e2e';

/**
 * Internal dependencies
 */
import LoginPage from '../lib/pages/login-page';

/**
 * Constants
 */
const mochaTimeOut = config.get( 'mochaTimeoutMS' );

describe( `Auth Screen @canary @parallel`, function () {
	this.timeout( mochaTimeOut );

	// BrowserContext is equivalent to the `driver` used in Selenium.
	let browserContext;
	// Page represents a tab in a browser.
	// Test steps interact with the page to execute its instructions.
	let page;

	before( 'Start browser', async function () {
		browserContext = await BrowserManager.newBrowserContext();
	} );

	beforeEach( 'Open new test tab', async function () {
		page = await browserContext.newPage();
		// Set the page using mocha's metadata. Upon test failure,
		// mocha hooks can access the page to perform actions.
		this.currentTest.page = page;
	} );

	describe( 'Loading the log-in page', function () {
		step( 'Can see the log in page', async function () {
			const url = LoginPage.getLoginURL();
			/*
			Waits for network activity to cease.
			Only as a proof of concept. In a production test, should check
			for the presence of desired elements using a selector.
			*/
			return await page.goto( url, { waitUntill: 'networkidle' } );
		} );
	} );

	after( 'close browser', function () {
		BrowserManager.quitBrowser();
	} );
} );
