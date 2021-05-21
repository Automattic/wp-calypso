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

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Auth Screen Canary: (${ screenSize }) @parallel @safaricanary`, function () {
	this.timeout( mochaTimeOut );

	it( 'Can see the log in screen', async function () {
		await LoginPage.Visit( this.driver, LoginPage.getLoginURL() );
	} );
} );
