/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';

import SettingsPage from '../../lib/pages/settings-page';

import LoginFlow from '../../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Jetpack Settings on Calypso: (${ screenSize }) @jetpack`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( this.driver );
	} );

	before( async function () {
		const loginFlow = new LoginFlow( this.driver, 'jetpackUser' + host );
		await loginFlow.loginAndSelectSettings();
		this.settingsPage = await SettingsPage.Expect( this.driver );
		return await this.settingsPage.selectWriting();
	} );

	describe( 'Can see Media Settings', function () {
		it( 'Can see media settings section', async function () {
			const shown = await this.settingsPage.mediaSettingsSectionDisplayed();
			assert( shown, "Can't see the media settings section under the Writing settings" );
		} );

		it( 'Can see the Carousel toggle switch', async function () {
			const shown = await this.settingsPage.carouselToggleDisplayed();
			assert( shown, "Can't see the carousel setting toggle under the Writing settings" );
		} );

		it( 'Can see the Carousel background color drop down', async function () {
			const shown = await this.settingsPage.carouseBackgroundColorDisplayed();
			assert(
				shown,
				"Can't see the carousel background color setting toggle under the Writing settings"
			);
		} );

		it( 'Can see the Photon toggle switch', async function () {
			await this.settingsPage.selectPerformance();
			const shown = await this.settingsPage.photonToggleDisplayed();
			assert( shown, "Can't see the Photon setting toggle under the Writing settings" );
		} );
	} );
} );
