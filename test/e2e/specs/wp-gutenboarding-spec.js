/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import * as driverManager from '../lib/driver-manager.js';
import GutenboardingPage from '../lib/pages/gutenboarding-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( 'Gutenboarding: (' + screenSize + ') @parallel', function () {
	this.timeout( mochaTimeOut );
	describe( 'Visit Gutenboarding page as a new user', function () {
		before( async function () {
			await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can visit Gutenboarding page and see Onboarding block', async function () {
			const page = await GutenboardingPage.Visit( driver );
			const blockExists = await page.waitForBlock();
			return assert( blockExists, 'Onboarding block is not rendered' );
		} );
	} );

	describe( 'Visit Gutenboarding page as a logged in user', function () {
		step( 'Can log in as user', async function () {
			this.loginFlow = new LoginFlow( driver );
			return this.loginFlow.login();
		} );
		step( 'Can visit Gutenboarding', async function () {
			await GutenboardingPage.Visit( driver );
		} );
	} );
} );
