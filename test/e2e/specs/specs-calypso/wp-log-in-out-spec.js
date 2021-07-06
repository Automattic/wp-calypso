/**
 * External dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper';
import LoginPage from '../../lib/pages/login-page';

const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Auth Screen Canary: (${ screenSize }) @parallel @safaricanary`, function () {
	let driver;

	beforeAll( () => ( driver = global.__BROWSER__ ) );

	it( 'Can see the log in screen', async function () {
		await LoginPage.Visit( driver, LoginPage.getLoginURL() );
	} );
} );
