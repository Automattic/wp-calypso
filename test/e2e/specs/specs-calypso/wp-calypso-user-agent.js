/**
 * External dependencies
 */
import assert from 'assert';

/**
 * External dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper';

import WPHomePage from '../../lib/pages/wp-home-page';

const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] User Agent: (${ screenSize }) @parallel @jetpack`, function () {
	let driver;

	beforeAll( () => ( driver = global.__BROWSER__ ) );

	it( 'Can see the correct user agent set', async function () {
		await WPHomePage.Visit( driver );
		const userAgent = await driver.executeScript( 'return navigator.userAgent;' );
		assert(
			userAgent.match( 'wp-e2e-tests' ),
			`User Agent does not contain 'wp-e2e-tests'.  [${ userAgent }]`
		);
	} );
} );
