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

describe( `Main Suite 1 @parallel`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Subsuite 1-1', function () {
		step( 'Can see the log in page', async function () {
			const url = LoginPage.getLoginURL();
			return await this.page.goto( url, { waitUntill: 'networkidle' } );
		} );
	} );

	describe( 'Subsuite 1-2', function () {
		step( 'Should also pass', async function () {
			return await this.page.goto( 'https://google.com', { waitUntill: 'networkidle' } );
		} );
	} );
} );

describe( `Main Suite 2 @parallel`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Subsuite 2-1', function () {
		before( 'start browser', async function () {
			this.page = await BrowserManager.start();
		} );

		step( 'Should fail', async function () {
			await this.page.click( 'non-existing-selector' );
		} );

		step( 'Should be aborted', async function () {
			const url = LoginPage.getLoginURL();
			/*
			Waits for network activity to cease.
			Only as a proof of concept. In a production test, should check
			for the presence of desired elements using a selector.
			*/
			return await this.page.goto( url, { waitUntill: 'networkidle' } );
		} );
	} );

	describe( 'Subsuite 2-2', function () {
		before( 'start browser', async function () {
			this.page = await BrowserManager.start();
		} );

		step( 'Should pass', async function () {
			return await this.page.goto( 'https://wordpress.com/support/', {
				waitUntill: 'networkidle',
			} );
		} );

		step( 'Also should pass', async function () {
			return await this.page.goto( 'https://wordpress.com/support/start', {
				waitUntill: 'networkidle',
			} );
		} );
	} );
} );
