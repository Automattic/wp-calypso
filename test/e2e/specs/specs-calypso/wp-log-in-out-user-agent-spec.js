/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * External dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper';

import WPHomePage from '../../lib/pages/wp-home-page';

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] User Agent: (${ screenSize }) @parallel @jetpack`, function () {
	let driver;

	beforeAll( async function () {
		driver = await driverManager.startBrowser();
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	}, startBrowserTimeoutMS );

	it( 'Can see the correct user agent set', async function () {
		await WPHomePage.Visit( driver );
		const userAgent = await driver.executeScript( 'return navigator.userAgent;' );
		assert(
			userAgent.match( 'wp-e2e-tests' ),
			`User Agent does not contain 'wp-e2e-tests'.  [${ userAgent }]`
		);
	} );
} );
