/**
 * External dependencies
 */
import config from 'config';

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

	// Page represents a tab in a browser.
	// Test steps interact with the page to execute its instructions.
	let page;

	// Open a new page (tab) within the BrowserContext.
	// This is akin to the following call in the Selenium test:
	// driver = await driverManager.startBrowser();
	before( 'Open new test tab', async function () {
		page = await this.browserContext.newPage();
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
} );
