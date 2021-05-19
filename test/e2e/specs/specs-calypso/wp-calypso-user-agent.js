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

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] User Agent: (${ screenSize }) @parallel @jetpack`, function () {
	this.timeout( mochaTimeOut );

	it( 'Can see the correct user agent set', async function () {
		await WPHomePage.Visit( this.driver );
		const userAgent = await this.driver.executeScript( 'return navigator.userAgent;' );
		assert(
			userAgent.match( 'wp-e2e-tests' ),
			`User Agent does not contain 'wp-e2e-tests'.  [${ userAgent }]`
		);
	} );
} );
