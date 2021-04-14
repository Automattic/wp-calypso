/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By } from 'selenium-webdriver';
import { step } from 'mocha-steps';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper';
import LoginFlow from '../lib/flows/login-flow.js';
import DeleteSiteFlow from '../lib/flows/delete-site-flow.js';
import GutenboardingFlow from '../lib/flows/gutenboarding-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const host = dataHelper.getJetpackHost();
const screenSize = driverManager.currentScreenSize();

describe( `[${ host }] Calypso Gutenberg Editor: Focused launch on (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Launch a free site', function () {
		const siteName = dataHelper.getNewBlogName();

		before( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.login();
		} );

		step( 'Can create a free site', async function () {
			const gutenboardingUrl = dataHelper.getCalypsoURL( '/new' );
			await driver.get( gutenboardingUrl );
			await new GutenboardingFlow( driver ).createFreeSite( siteName );
		} );

		step( 'Can open focused launch modal', async function () {
			const launchButtonSelector = By.css( '.editor-gutenberg-launch__launch-button' );
			await driverHelper.clickWhenClickable( driver, launchButtonSelector );

			const focusedLaunchModalSelector = By.css( '.launch__focused-modal' );
			const isFocusedLaunchModalPresent = await driverHelper.isElementPresent(
				driver,
				focusedLaunchModalSelector
			);

			assert( isFocusedLaunchModalPresent, 'Focused launch modal did not open.' );
		} );

		after( 'Delete the newly created site', async function () {
			const deleteSite = new DeleteSiteFlow( driver );
			await deleteSite.deleteSite( siteName + '.wordpress.com' );
		} );
	} );
} );
