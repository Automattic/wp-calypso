/** @format */

import assert from 'assert';

import config from 'config';
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import PluginsPage from '../lib/pages/plugins-page';
import PluginsBrowserPage from '../lib/pages/plugins-browser-page';

import PluginDetailsPage from '../lib/pages/plugin-details-page';
import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Jetpack Sites on Calypso - Existing Plugins: (${ screenSize }) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	before( async function() {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );

		let loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
		await loginFlow.loginAndSelectManagePlugins();
	} );

	describe( 'Can activate Hello Dolly', function() {
		step( 'Ensure Hello Dolly is deactivated', async function() {
			const pluginsPage = await PluginsPage.Expect( driver );
			await pluginsPage.viewPlugin( 'hello' );
			const pluginDetailsPage = await PluginDetailsPage.Expect( driver );
			await pluginDetailsPage.waitForPlugin();
			await pluginDetailsPage.ensureDeactivated();
			return await pluginDetailsPage.goBack();
		} );

		step( 'Can view the plugin details to activate Hello Dolly', async function() {
			const pluginsPage = await PluginsPage.Expect( driver );
			await pluginsPage.viewPlugin( 'hello' );
			const pluginDetailsPage = await PluginDetailsPage.Expect( driver );
			await pluginDetailsPage.waitForPlugin();
			return await pluginDetailsPage.clickActivateToggleForPlugin();
		} );

		step( 'Success message contains Hello Dolly', async function() {
			const expectedPartialText = 'Successfully activated Hello Dolly';
			const pluginDetailsPage = await PluginDetailsPage.Expect( driver );
			await pluginDetailsPage.waitForSuccessNotice();
			let successMessageText = await pluginDetailsPage.getSuccessNoticeText();
			return assert.strictEqual(
				successMessageText.indexOf( expectedPartialText ) > -1,
				true,
				`The success message '${ successMessageText }' does not include '${ expectedPartialText }'`
			);
		} );
	} );
} );

describe( `[${ host }] Jetpack Sites on Calypso - Searching Plugins: (${ screenSize }) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	before( async function() {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );

		let loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
		await loginFlow.loginAndSelectPlugins();
	} );

	describe( 'Can use the plugins browser to find Automattic plugins', function() {
		step(
			'Open the plugins browser and find WP Job Manager by searching for Automattic',
			async function() {
				const pluginVendor = 'WP Job Manager';
				const pluginTitle = 'WP Job Manager';
				const pluginsBrowserPage = await PluginsBrowserPage.Expect( driver );
				await pluginsBrowserPage.searchForPlugin( pluginVendor );
				let pluginDisplayed = await pluginsBrowserPage.pluginTitledShown(
					pluginTitle,
					pluginVendor
				);
				assert( pluginDisplayed, `The plugin titled ${ pluginTitle } was not displayed` );
			}
		);
	} );
} );
