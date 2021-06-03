/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginPage from '../../lib/pages/login-page';
import ThemesPage from '../../lib/pages/themes-page';
import * as dataHelper from '../../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );

async function ssrWorksForPage( driver, url ) {
	await driver.get( url );
	const layoutLocator = By.css( '#wpcom[data-calypso-ssr="true"]' );
	assert( await driver.findElement( layoutLocator ) );
}

describe( 'Server-side rendering: @canary @parallel', function () {
	this.timeout( mochaTimeOut );

	it( '/log-in renders on the server', async function () {
		await ssrWorksForPage( this.driver, LoginPage.getLoginURL() );
	} );

	it( '/themes renders on the server', async function () {
		await ssrWorksForPage( this.driver, ThemesPage.getStartURL() );
	} );

	it( '/theme/twentytwenty renders on the server', async function () {
		await ssrWorksForPage( this.driver, dataHelper.getCalypsoURL( 'theme/twentytwenty' ) );
	} );
} );
