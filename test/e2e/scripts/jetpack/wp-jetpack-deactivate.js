/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';

import LoginFlow from '../../lib/flows/login-flow';
import SidebarComponent from '../../lib/components/sidebar-component';
import SettingsPage from '../../lib/pages/settings-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( function () {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

describe( `[${ host }] Jetpack Connection Removal: (${ screenSize }) @jetpack`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Deactivate Jetpack Plugin:', function () {
		before( async function () {
			return await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		step( 'Can log into WordPress.com and open My Sites', async function () {
			this.loginFlow = new LoginFlow( driver, 'jetpackUserCI' );
			return await this.loginFlow.loginAndSelectMySite();
		} );

		step( 'Can open site Settings', async function () {
			this.sidebarComponent = await SidebarComponent.Expect( driver );
			return await this.sidebarComponent.selectSettings();
		} );

		step( 'Can manage connection', async function () {
			this.settingsPage = await SettingsPage.Expect( driver );
			return await this.settingsPage.manageConnection();
		} );

		step( 'Can disconnect site', async function () {
			return await this.settingsPage.disconnectSite();
		} );
	} );
} );
