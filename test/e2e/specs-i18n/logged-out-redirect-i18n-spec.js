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

// call run.sh with -I to feed in the mag16
const locale = driverManager.currentLocale();

describe( `Logged out homepage redirect test @i18n (${ locale })`, function () {
	this.timeout( mochaTimeOut );

	it( `should redirect to the correct url for wordpress.com (${ locale })`, async function () {
		// No culture here implies 'en'
		const wpHomePage = await WPHomePage.Visit( this.driver );
		await wpHomePage.checkURL( locale );
	} );
} );
