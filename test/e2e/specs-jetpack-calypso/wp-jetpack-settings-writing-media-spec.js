/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import SettingsPage from '../lib/pages/settings-page';

import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Jetpack Settings on Calypso: (${ screenSize }) @jetpack`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	before( async function () {
		const loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
		await loginFlow.loginAndSelectSettings();
		this.settingsPage = await SettingsPage.Expect( driver );
		return await this.settingsPage.selectWriting();
	} );

	describe( 'Can see Media Settings', function () {
		step( 'Can see media settings section', async function () {
			const shown = await this.settingsPage.mediaSettingsSectionDisplayed();
			assert( shown, "Can't see the media settings section under the Writing settings" );
		} );

		step( 'Can see the Carousel toggle switch', async function () {
			const shown = await this.settingsPage.carouselToggleDisplayed();
			assert( shown, "Can't see the carousel setting toggle under the Writing settings" );
		} );

		step( 'Can see the Carousel background color drop down', async function () {
			const shown = await this.settingsPage.carouseBackgroundColorDisplayed();
			assert(
				shown,
				"Can't see the carousel background color setting toggle under the Writing settings"
			);
		} );

		step( 'Can see the Photon toggle switch', async function () {
			await this.settingsPage.selectPerformance();
			const shown = await this.settingsPage.photonToggleDisplayed();
			assert( shown, "Can't see the Photon setting toggle under the Writing settings" );
		} );
	} );
} );
