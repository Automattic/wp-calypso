/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';
import NewPage from '../../lib/pages/gutenboarding/new-page.js';

import * as driverManager from '../../lib/driver-manager.js';

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

describe( 'Gutenboarding: (' + screenSize + ')', function () {
	let driver;

	beforeAll( async function () {
		driver = await driverManager.startBrowser();
	}, startBrowserTimeoutMS );

	describe( 'Visit Gutenboarding page as a logged in user @parallel', function () {
		it( 'Can log in as user', async function () {
			await new LoginFlow( driver ).login();
		} );

		it( 'Can visit Gutenboarding', async function () {
			await NewPage.Visit( driver );
		} );
	} );
} );
