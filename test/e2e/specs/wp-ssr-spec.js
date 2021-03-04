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

async function ssrWorksForPage( driver, url ) {
	await driver.get( url );
	const layoutSelector = by.css( '#wpcom[data-calypso-ssr="true"]' );
	assert( await driver.findElement( layoutSelector ) );
}

describe( 'Server-side rendering: @canary @parallel', function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
		await driverManager.ensureNotLoggedIn( driver );
	} );

	step( '/log-in renders on the server', async function () {
		await ssrWorksForPage( driver, LoginPage.getLoginURL() );
	} );

	step( '/themes renders on the server', async function () {
		await ssrWorksForPage( driver, ThemesPage.getStartURL() );
	} );

	step( '/theme/twentytwenty renders on the server', async function () {
		await ssrWorksForPage( driver, dataHelper.getCalypsoURL( 'theme/twentytwenty' ) );
	} );
} );
