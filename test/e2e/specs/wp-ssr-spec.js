/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginPage from '../lib/pages/login-page';
import ThemesPage from '../lib/pages/themes-page';
import * as dataHelper from '../lib/data-helper';
import * as driverManager from '../lib/driver-manager';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

let driver;

async function ssrWorksForPage( url ) {
	await driver.get( url );
	const layoutSelector = by.css( '#wpcom[data-calypso-ssr="true"]' );
	assert( await driver.findElement( layoutSelector ) );
}

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
	await driverManager.ensureNotLoggedIn( driver );
} );

describe( 'Server-side rendering: @canary @parallel', function () {
	this.timeout( mochaTimeOut );
	step( '/log-in renders on the server', async function () {
		await ssrWorksForPage( LoginPage.getLoginURL() );
	} );

	step( '/themes renders on the server', async function () {
		await ssrWorksForPage( ThemesPage.getStartURL() );
	} );

	step( '/theme/twentytwenty renders on the server', async function () {
		await ssrWorksForPage( dataHelper.getCalypsoURL( 'theme/twentytwenty' ) );
	} );
} );
