/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager';
import { getJetpackHost } from '../lib/data-helper';

import PluginsPage from '../lib/pages/plugins-page';
import PluginsBrowserPage from '../lib/pages/plugins-browser-page';

import PluginDetailsPage from '../lib/pages/plugin-details-page';
import LoginFlow from '../lib/flows/login-flow';
import NoticesComponent from '../lib/components/notices-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = getJetpackHost();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Jetpack Plugins - Activating a plugin: (${ screenSize }) @jetpack`, function () {
	this.timeout( mochaTimeOut );

	step( 'Can login and select Manage Plugins', async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );

		const loginFlow = new LoginFlow( driver );
		await loginFlow.loginAndSelectManagePlugins();
	} );

	step( 'Can ensure Hello Dolly is deactivated', async function () {
		const pluginsPage = await PluginsPage.Expect( driver );
		await pluginsPage.viewPlugin( 'hello' );
		const pluginDetailsPage = await PluginDetailsPage.Expect( driver );
		await pluginDetailsPage.waitForPlugin();
		await pluginDetailsPage.ensureDeactivated();
		return await pluginDetailsPage.goBack();
	} );

	step( 'Can view the plugin details to activate Hello Dolly', async function () {
		const pluginsPage = await PluginsPage.Expect( driver );
		await pluginsPage.viewPlugin( 'hello' );
		const pluginDetailsPage = await PluginDetailsPage.Expect( driver );
		await pluginDetailsPage.waitForPlugin();
		return await pluginDetailsPage.clickActivateToggleForPlugin();
	} );

	step( 'Can see a success message contains Hello Dolly', async function () {
		const expectedPartialText = 'Successfully activated Hello Dolly';
		const noticesComponent = await NoticesComponent.Expect( driver );
		await noticesComponent.isSuccessNoticeDisplayed();
		const successMessageText = await noticesComponent.getNoticeContent();
		return assert.strictEqual(
			successMessageText.indexOf( expectedPartialText ) > -1,
			true,
			`The success message '${ successMessageText }' does not include '${ expectedPartialText }'`
		);
	} );
} );

describe( `[${ host }] Jetpack Plugins - Searching a plugin: (${ screenSize }) @jetpack`, function () {
	this.timeout( mochaTimeOut );

	step( 'Can login and select Plugins', async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );

		const loginFlow = new LoginFlow( driver );
		await loginFlow.loginAndSelectPlugins();
	} );

	step(
		'Can open the plugins browser and find WP Job Manager by searching for Automattic',
		async function () {
			const pluginVendor = 'WP Job Manager';
			const pluginTitle = 'WP Job Manager';
			const pluginsBrowserPage = await PluginsBrowserPage.Expect( driver );
			await pluginsBrowserPage.searchForPlugin( pluginVendor );
			const pluginDisplayed = await pluginsBrowserPage.pluginTitledShown(
				pluginTitle,
				pluginVendor
			);
			assert( pluginDisplayed, `The plugin titled ${ pluginTitle } was not displayed` );
		}
	);
} );
