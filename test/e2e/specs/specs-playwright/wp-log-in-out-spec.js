/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginPage from '../../lib/pages/login-page';

/**
 * Constants
 */
const mochaTimeOut = config.get( 'mochaTimeoutMS' );

describe( `Main Suite 1 @parallel`, function () {
	// Tests scenario where @parallel tag is located at the top level describe block.
	this.timeout( mochaTimeOut );

	describe( 'Subsuite 1-1', function () {
		it( 'Can see the log in page', async function () {
			const url = LoginPage.getLoginURL();
			return await this.page.goto( url, { waitUntill: 'networkidle' } );
		} );
	} );

	describe( 'Subsuite 1-2', function () {
		it( 'Should also pass', async function () {
			return await this.page.goto( 'https://google.com', { waitUntill: 'networkidle' } );
		} );
	} );
} );

describe( `Main Suite 2`, function () {
	// Tests scenario where @parallel tag is within the nested describe blocks.
	this.timeout( mochaTimeOut );

	describe( 'Subsuite 2-1 @parallel', function () {
		it( 'Should pass', async function () {
			const url = LoginPage.getLoginURL();
			await this.page.goto( url, { waitUntill: 'networkidle' } );
		} );

		it( 'Should fail', async function () {
			await this.page.click( 'non-existing-selector' );
		} );

		it( 'Should be aborted', async function () {
			const url = LoginPage.getLoginURL();
			return await this.page.goto( url, { waitUntill: 'networkidle' } );
		} );
	} );

	describe( 'Subsuite 2-2 @parallel', function () {
		it( 'Should pass', async function () {
			await this.page.goto( 'https://wordpress.com/support/', {
				waitUntill: 'networkidle',
			} );
		} );

		it( 'Also should pass', async function () {
			await this.page.goto( 'https://wordpress.com/support/start', {
				waitUntill: 'networkidle',
			} );
		} );
	} );
} );
