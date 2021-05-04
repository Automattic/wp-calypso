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

describe( `Main Suite 1 @parallel`, function () {
	this.timeout( mochaTimeOut );
	let page;

	describe( 'Subsuite 1', function () {
		step( 'Can see the log in page', async function () {
			page = this.page;
			const url = LoginPage.getLoginURL();
			/*
			Waits for network activity to cease.
			Only as a proof of concept. In a production test, should check
			for the presence of desired elements using a selector.
			*/
			return await page.goto( url, { waitUntill: 'networkidle' } );
		} );
	} );

	describe( 'Subsuite 2', function () {
		step( 'Can alsosee the log in page', async function () {
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

describe( `Main Suite 2 @parallel`, function () {
	this.timeout( mochaTimeOut );
	let page;

	describe( 'Subsuite 1', function () {
		step( 'Should fail', async function () {
			page = this.page;
			await page.click( 'non-existing-selector' );
		} );

		step( 'Should be aborted', async function () {
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
