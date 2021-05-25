/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager';
import { getJetpackHost } from '../../lib/data-helper';

import PluginsBrowserPage from '../../lib/pages/plugins-browser-page';
import LoginFlow from '../../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = getJetpackHost();

describe( `[${ host }] Jetpack Plugins - Searching a plugin: (${ screenSize }) @jetpack`, function () {
	this.timeout( mochaTimeOut );

	it( 'Can login and select Plugins', async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( this.driver );

		const loginFlow = new LoginFlow( this.driver );
		await loginFlow.loginAndSelectPluginsJetpack();
	} );

	it( 'Can open the plugins browser and find WP Job Manager by searching for Automattic', async function () {
		const pluginVendor = 'WP Job Manager';
		const pluginTitle = 'WP Job Manager';
		const pluginsBrowserPage = await PluginsBrowserPage.Expect( this.driver );
		await pluginsBrowserPage.searchForPlugin( pluginVendor );
		const pluginDisplayed = await pluginsBrowserPage.pluginTitledShown( pluginTitle, pluginVendor );
		assert( pluginDisplayed, `The plugin titled ${ pluginTitle } was not displayed` );
	} );
} );
