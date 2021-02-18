/**
 * External Dependencies
 *
 */

import config from 'config';

/**
 * Internal Dependencies
 */
import * as driverManager from '../lib/driver-manager.js';

import WPHomePage from '../lib/pages/wp-home-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

// call run.sh with -I to feed in the mag16
const locale = driverManager.currentLocale();

let driver;

before( function () {
	this.timeout( startBrowserTimeoutMS );
} );

describe( `Logged out homepage redirect test @i18n (${ locale })`, function () {
	this.timeout( mochaTimeOut );

	step( `should redirect to the correct url for wordpress.com (${ locale })`, async function () {
		driver = await driverManager.startBrowser();

		// No culture here implies 'en'
		const wpHomePage = await WPHomePage.Visit( driver );
		await wpHomePage.checkURL( locale );
	} );
} );
