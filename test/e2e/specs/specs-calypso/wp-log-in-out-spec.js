/**
 * External dependencies
 */
import config from 'config';

/**
 * External dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper';

import LoginPage from '../../lib/pages/login-page';

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Auth Screen Canary: (${ screenSize }) @parallel @safaricanary`, function () {
	let driver;

	beforeAll( async function () {
		driver = await driverManager.startBrowser();
		return await driverManager.ensureNotLoggedIn( driver );
	}, startBrowserTimeoutMS );

	describe( 'Loading the log-in screen', function () {
		it( 'Can see the log in screen', async function () {
			await LoginPage.Visit( driver, LoginPage.getLoginURL() );
		} );
	} );
} );
